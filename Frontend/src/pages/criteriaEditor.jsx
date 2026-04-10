import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Form,
  InputNumber,
  Slider,
  Checkbox,
  Row,
  Col,
  Divider,
  message,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Radio } from 'antd';
import { history, useLocation } from 'umi';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';
import { getTemplateElements } from '@/apis/getTemplateElements';
import styles from './criteriaEditor.module.less';

const { Title, Text } = Typography;

// Custom component to sync InputNumber and Slider
const WeightingInput = ({ value = 0, onChange }) => {
  const handleChange = (newValue) => {
    onChange?.(newValue);
  };

  return (
    <div className={styles.weightingInput}>
      <InputNumber
        min={0}
        max={100}
        formatter={(val) => `${val}%`}
        parser={(val) => val.replace('%', '')}
        className={styles.numberInput}
        value={value}
        onChange={handleChange}
      />
      <Slider
        min={0}
        max={100}
        className={styles.sliderInput}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

const CriteriaEditor = observer(() => {
  const { assessmentStore } = useStores();

  // State for template elements from backend
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElements, setSelectedElements] = useState(new Set());

  const [form] = Form.useForm();

  // Fetch template elements from backend
  useEffect(() => {
    fetchTemplateElements();
  }, []);

  // Sync with assessmentStore data when elements are loaded
  useEffect(() => {
    if (elements.length > 0 && assessmentStore.hasElements) {
      syncWithAssessmentStore();
    }
  }, [elements, assessmentStore.elementList]);

  const fetchTemplateElements = async () => {
    try {
      setLoading(true);
      const response = await getTemplateElements();
      if (response.code === 200 && response.data) {
        setElements(response.data);
        // Set default values for each element
        const initialValues = {};
        response.data.forEach((element) => {
          initialValues[`weighting_${element.id}`] = element.weighting || 0;
          initialValues[`maxMark_${element.id}`] = element.maximumMark || 10;
          initialValues[`markIncrement_${element.id}`] =
            element.markIncrements || 0.5;
        });
        form.setFieldsValue(initialValues);
      } else {
        message.error('Failed to load template elements');
      }
    } catch (error) {
      console.error('Error fetching template elements:', error);
      message.error('Failed to load template elements');
    } finally {
      setLoading(false);
    }
  };

  // Sync form data with assessmentStore
  const syncWithAssessmentStore = () => {
    const selectedIds = new Set();
    const formValues = {};

    // Process each element in assessmentStore
    assessmentStore.elementList.forEach((storeElement) => {
      const elementId = storeElement.elementId;
      selectedIds.add(elementId);

      // Set form values from store
      formValues[`weighting_${elementId}`] = storeElement.weighting;
      formValues[`maxMark_${elementId}`] = storeElement.maximumMark;
      formValues[`markIncrement_${elementId}`] = storeElement.markIncrements;
    });

    // Update selected elements state
    setSelectedElements(selectedIds);

    // Update form values
    form.setFieldsValue(formValues);
  };

  const handleBack = () => {
    history.back();
  };

  const handleElementSelect = (elementId, checked) => {
    const newSelected = new Set(selectedElements);
    if (checked) {
      newSelected.add(elementId);
    } else {
      newSelected.delete(elementId);
    }
    setSelectedElements(newSelected);
    const names = Array.from(newSelected).map((id) => `weighting_${id}`);
    if (names.length > 0) {
      form.validateFields(names).catch(() => {});
    }
  };

  const handleSave = () => {
    if (selectedElements.size === 0) {
      message.warning('Please select at least one element');
      return;
    }

    form
      .validateFields()
      .then((values) => {
        // Build the elements array in the specified format
        const selectedElementsData = Array.from(selectedElements).map(
          (elementId) => {
            const element = elements.find((e) => e.id === elementId);
            return {
              elementId: elementId,
              Name: element.name,
              weighting: values[`weighting_${elementId}`],
              maximumMark: values[`maxMark_${elementId}`],
              markIncrements: values[`markIncrement_${elementId}`],
            };
          }
        );

        // Save to assessmentStore
        assessmentStore.setElements(selectedElementsData);

        // Show success message and redirect back
        message.success('Assessment criteria saved successfully');
        history.back();
      })
      .catch((err) => {
        console.error('Validation failed:', err);
        message.error('Please fix all validation errors before saving');
      });
  };

  const validateWeightings = (_, value) => {
    // Calculate total weighting for selected elements only
    let totalWeighting = 0;
    selectedElements.forEach((elementId) => {
      const fieldName = `weighting_${elementId}`;
      const fieldValue = form.getFieldValue(fieldName);
      totalWeighting += Number(fieldValue || 0);
    });

    if (selectedElements.size > 0 && totalWeighting !== 100) {
      return Promise.reject('Total weighting must equal 100%');
    }
    return Promise.resolve();
  };

  if (loading) {
    return (
      <div className={styles.criteriaEditorPage}>
        <div className={styles.loadingContainer}>
          <Spin size="large" tip="Loading template elements..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.criteriaEditorPage}>
      {/* Header */}
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className={styles.backButton}
        >
          Back
        </Button>
        <Title level={2} className={styles.pageTitle}>
          Assessment Criteria
        </Title>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          className={styles.saveButton}
        >
          Save
        </Button>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <Form
          form={form}
          layout="vertical"
          className={styles.criteriaForm}
          onValuesChange={() => {
            const names = Array.from(selectedElements).map(
              (id) => `weighting_${id}`
            );
            if (names.length > 0) {
              form.validateFields(names).catch(() => {});
            }
          }}
        >
          {elements.map((element) => {
            const isSelected = selectedElements.has(element.id);
            return (
              <Card
                key={element.id}
                className={`${styles.criteriaCard} ${!isSelected ? styles.unselected : ''}`}
              >
                <div className={styles.criteriaHeader}>
                  <Checkbox
                    className={styles.criteriaCheckbox}
                    checked={isSelected}
                    onChange={(e) =>
                      handleElementSelect(element.id, e.target.checked)
                    }
                  />
                  <div className={styles.criteriaNameDisplay}>
                    <Title level={4} style={{ margin: 0 }}>
                      {element.name}
                    </Title>
                  </div>
                </div>

                {isSelected && (
                  <>
                    <Divider className={styles.criteriaDivider} />

                    <Row gutter={[24, 16]} className={styles.criteriaDetails}>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label="Weighting"
                          name={`weighting_${element.id}`}
                          dependencies={Array.from(selectedElements).map(
                            (id) => `weighting_${id}`
                          )}
                          rules={[
                            { required: true, message: 'Required' },
                            { validator: validateWeightings },
                          ]}
                        >
                          <WeightingInput />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label="Maximum Mark"
                          name={`maxMark_${element.id}`}
                          rules={[{ required: true, message: 'Required' }]}
                        >
                          <InputNumber
                            min={1}
                            className={styles.numberInput}
                            controls={{
                              upIcon: <PlusOutlined />,
                              downIcon: <MinusOutlined />,
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label="Mark Increments"
                          name={`markIncrement_${element.id}`}
                          rules={[{ required: true, message: 'Required' }]}
                        >
                          <Radio.Group>
                            <Radio.Button value={0.25}>1/4</Radio.Button>
                            <Radio.Button value={0.5}>1/2</Radio.Button>
                            <Radio.Button value={1}>1</Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )}
              </Card>
            );
          })}
        </Form>
      </div>
    </div>
  );
});

export default CriteriaEditor;
