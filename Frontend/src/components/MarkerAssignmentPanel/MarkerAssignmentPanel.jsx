import React from 'react';
import { Button, Card, Empty, Select, Space, Table, Tag, Typography } from 'antd';
import styles from './MarkerAssignmentPanel.module.less';

const { Text } = Typography;

export default function MarkerAssignmentPanel({
  projectType,
  assignmentRows,
  unassignedCount,
  selectedMarkerPoolCount,
  markerOptions,
  bulkMarkerIds,
  onBulkMarkerIdsChange,
  onApplyBulkAssignment,
  rowSelection,
  individualColumns,
  groupColumns,
  groupMemberColumns,
  pageSize = 8,
  markerPoolEmptyDescription = 'Please choose marker pool first (Select Markers button above).',
  groupRowsEmptyDescription = 'No groups available. Please form groups first.',
  individualRowsEmptyDescription = 'No students available.',
}) {
  return (
    <Card className={styles.assignmentCard}>
      <div className={styles.assignmentHeader}>
        <div>
          <Text strong>
            {projectType === 'group'
              ? 'Assign markers to each group'
              : 'Assign markers to each student'}
          </Text>
          <div className={styles.assignmentMeta}>
            <Tag color="blue">Rows: {assignmentRows.length}</Tag>
            <Tag color={unassignedCount === 0 ? 'success' : 'warning'}>
              Unassigned: {unassignedCount}
            </Tag>
            <Tag color="purple">Marker pool: {selectedMarkerPoolCount}</Tag>
          </div>
        </div>
      </div>

      {selectedMarkerPoolCount === 0 ? (
        <Empty
          description={markerPoolEmptyDescription}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: '16px 0' }}
        />
      ) : assignmentRows.length === 0 ? (
        <Empty
          description={
            projectType === 'group'
              ? groupRowsEmptyDescription
              : individualRowsEmptyDescription
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: '16px 0' }}
        />
      ) : (
        <>
          <Space className={styles.bulkToolbar} wrap>
            <Select
              mode="multiple"
              allowClear
              showSearch
              placeholder="Choose markers for bulk action"
              options={markerOptions}
              value={bulkMarkerIds}
              onChange={onBulkMarkerIdsChange}
              style={{ minWidth: 260 }}
            />
            <Button onClick={() => onApplyBulkAssignment('append')}>Append to selected</Button>
            <Button onClick={() => onApplyBulkAssignment('replace')}>Replace selected</Button>
            <Button onClick={() => onApplyBulkAssignment('remove')}>Remove selected markers</Button>
            <Button danger onClick={() => onApplyBulkAssignment('clear')}>
              Clear selected rows
            </Button>
          </Space>

          <Table
            className={styles.assignmentTable}
            rowKey={(row) => row.__rowKey}
            rowSelection={rowSelection}
            dataSource={assignmentRows}
            columns={projectType === 'group' ? groupColumns : individualColumns}
            pagination={{ pageSize }}
            expandable={
              projectType === 'group'
                ? {
                    expandedRowRender: (group) => (
                      <Table
                        rowKey={(student) => String(student.studentId)}
                        size="small"
                        dataSource={Array.isArray(group.students) ? group.students : []}
                        columns={groupMemberColumns}
                        pagination={false}
                      />
                    ),
                    rowExpandable: (group) =>
                      Array.isArray(group.students) && group.students.length > 0,
                  }
                : undefined
            }
          />
        </>
      )}
    </Card>
  );
}
