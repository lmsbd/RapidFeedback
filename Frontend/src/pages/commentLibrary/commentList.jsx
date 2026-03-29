import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'umi';
import BackButton from '../../components/BackButton/BackButton';
import {
  Card,
  Button,
  Typography,
  List,
  Tag,
  message,
  Modal,
  Form,
  Input,
  Radio,
  Spin,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { getCommentList, saveComment, deleteComment } from '@/apis/comment';
import styles from './commentList.module.less';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

const CommentList = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({ positive: [], neutral: [], negative: [] });
  const [categoryName, setCategoryName] = useState('');
  const [elementName, setElementName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // Get element name from URL query parameters
    const urlParams = new URLSearchParams(location.search);
    const elementNameFromUrl = urlParams.get('elementName');
    if (elementNameFromUrl) {
      setElementName(decodeURIComponent(elementNameFromUrl));
    }
    
    fetchComments();
  }, [categoryId, location.search]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getCommentList(Number(categoryId));
      
      if (response.code === 200 && response.data) {
        // Group comments by type
        const grouped = {
          positive: [],
          neutral: [],
          negative: []
        };
        
        response.data.forEach(comment => {
          // commentType: 2=positive, 1=neutral, 0=negative
          if (comment.commentType === 2) {
            grouped.positive.push(comment);
          } else if (comment.commentType === 1) {
            grouped.neutral.push(comment);
          } else if (comment.commentType === 0) {
            grouped.negative.push(comment);
          }
        });
        
        setComments(grouped);
        
        // Get category name from first comment if available
        if (response.data.length > 0 && response.data[0].templateElementName) {
          setCategoryName(response.data[0].templateElementName);
        }
      } else {
        message.error('Failed to load comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      message.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = () => {
    setEditingComment(null);
    form.resetFields();
    form.setFieldsValue({ commentType: 2 }); // Default to positive
    setModalVisible(true);
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    form.setFieldsValue({
      content: comment.content,
      commentType: comment.commentType,
    });
    setModalVisible(true);
  };

  const handleDeleteComment = (commentId) => {
    confirm({
      title: 'Are you sure you want to delete this comment?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await deleteComment(commentId);
          if (response.code === 200) {
            message.success('Comment deleted successfully');
            fetchComments(); // Refresh list
          } else {
            message.error(response.msg || 'Failed to delete comment');
          }
        } catch (error) {
          console.error('Error deleting comment:', error);
          message.error('Failed to delete comment');
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const commentData = {
        id: editingComment ? editingComment.id : null,
        templateElementId: Number(categoryId),
        content: values.content,
        commentType: values.commentType,
      };

      const response = await saveComment(commentData);
      
      if (response.code === 200) {
        message.success(editingComment ? 'Comment updated successfully' : 'Comment added successfully');
        setModalVisible(false);
        form.resetFields();
        fetchComments(); // Refresh list
      } else {
        message.error(response.msg || 'Failed to save comment');
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      message.error('Failed to save comment');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const getTagColor = (type) => {
    switch (type) {
      case 2:
        return 'green';
      case 0:
        return 'red';
      case 1:
        return 'blue';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 2:
        return 'Positive';
      case 0:
        return 'Negative';
      case 1:
        return 'Neutral';
      default:
        return 'Unknown';
    }
  };

  const renderCommentSection = (title, commentList, typeValue, color) => (
    <Card
      title={
        <div className={styles.sectionTitle}>
          <Tag color={color} className={styles.typeTag}>
            {title}
          </Tag>
          <Text className={styles.count}>({commentList.length})</Text>
        </div>
      }
      className={styles.commentSection}
    >
      {commentList.length === 0 ? (
        <div className={styles.emptyState}>
          <Text type="secondary">No {title.toLowerCase()} comments yet</Text>
        </div>
      ) : (
        <List
          dataSource={commentList}
          renderItem={(comment) => (
            <List.Item
              className={styles.commentItem}
              actions={[
                <Button
                  key="edit"
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditComment(comment)}
                  className={styles.actionButton}
                >
                  Edit
                </Button>,
                <Button
                  key="delete"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteComment(comment.id)}
                  className={styles.actionButton}
                >
                  Delete
                </Button>,
              ]}
            >
              <div className={styles.commentContent}>
                <Text>{comment.content}</Text>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );

  if (loading) {
    return (
      <div className={styles.commentListPage}>
        <div className={styles.header}>
          <BackButton />
          <Title level={2} className={styles.pageTitle}>
            {elementName || 'Category'} - Comment List
          </Title>
        </div>
        <div className={styles.loadingContainer}>
          <Spin size="large" tip="Loading comments..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.commentListPage}>
      <div className={styles.header}>
        <BackButton />
        <Title level={2} className={styles.pageTitle}>
          {elementName}
        </Title>
      </div>
      <div className={styles.mainContent}>
        {renderCommentSection('Positive', comments.positive, 2, 'green')}
        {renderCommentSection('Neutral', comments.neutral, 1, 'blue')}
        {renderCommentSection('Negative', comments.negative, 0, 'red')}
      </div>
      <div className={styles.addButtonContainer}>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleAddComment}
          className={styles.addButton}
        >
          Add Comment
        </Button>
      </div>

      {/* Add/Edit Comment Modal */}
      <Modal
        title={editingComment ? 'Edit Comment' : 'Add Comment'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="Save"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            commentType: 2,
          }}
        >
          <Form.Item
            name="commentType"
            label="Comment Type"
            rules={[{ required: true, message: 'Please select a comment type' }]}
          >
            <Radio.Group>
              <Radio.Button value={2} style={{ color: '#52c41a' }}>
                Positive
              </Radio.Button>
              <Radio.Button value={1} style={{ color: '#1890ff' }}>
                Neutral
              </Radio.Button>
              <Radio.Button value={0} style={{ color: '#ff4d4f' }}>
                Negative
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="content"
            label="Comment Content"
            rules={[
              { required: true, message: 'Please enter comment content' },
              { min: 2, message: 'Content must be at least 2 characters' },
              { max: 500, message: 'Content cannot exceed 500 characters' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter comment content"
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CommentList;
