import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
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

const { Title } = Typography;

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
  const { assessmentStore, projectStore } = useStores();
  const location = useLocation();
  const fromEditProjectId = useMemo(() => {
    const params = new URLSearchParams(location.search || '');
    const value = params.get('fromEditProject');
    return value ? String(value) : null;
  }, [location.search]);

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
    const templateById = new Map(elements.map((el) => [el.id, el]));
    const templateByName = new Map(
      elements.map((el) => [
        String(el.name || '')
          .trim()
          .toLowerCase(),
        el,
      ])
    );

    // Process each element in assessmentStore
    assessmentStore.elementList.forEach((storeElement) => {
      const rawId = storeElement.elementId;
      const normalizedName = String(
        storeElement.Name ?? storeElement.name ?? ''
      )
        .trim()
        .toLowerCase();
      const resolvedTemplate =
        templateById.get(rawId) || templateByName.get(normalizedName);

      if (!resolvedTemplate) return;
      const elementId = resolvedTemplate.id;
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
        const hasZeroWeightingSelected = Array.from(selectedElements).some(
          (elementId) => Number(values[`weighting_${elementId}`] || 0) === 0
        );
        const effectiveSelectedIds = Array.from(selectedElements).filter(
          (elementId) => Number(values[`weighting_${elementId}`] || 0) > 0
        );

        if (effectiveSelectedIds.length === 0) {
          message.warning(
            'All selected criteria have 0% weighting. Criteria with 0% weighting are treated as not added and will not be saved. Please set at least one weighting above 0%.'
          );
          return;
        }

        if (hasZeroWeightingSelected) {
          message.info({
            key: 'criteria-zero-weighting',
            content:
              'Selected criteria with 0% weighting will be ignored and not saved.',
          });
        }

        // Build the elements array in the specified format
        const selectedElementsData = effectiveSelectedIds
          .map((elementId) => {
            const element = elements.find((e) => e.id === elementId);
            if (!element) return null;
            return {
              elementId: elementId,
              Name: element.name,
              weighting: values[`weighting_${elementId}`],
              maximumMark: values[`maxMark_${elementId}`],
              markIncrements: values[`markIncrement_${elementId}`],
            };
          })
          .filter(Boolean);

        // Save to assessmentStore
        assessmentStore.setElements(selectedElementsData);

        // Keep edit-project cache in sync so returning page won't restore stale criteria.
        if (fromEditProjectId) {
          const cached = projectStore.getEditProjectDetail(fromEditProjectId);
          if (cached) {
            const nextAssessment = selectedElementsData.map((item) => ({
              elementId: item.elementId,
              name: item.Name,
              weighting: item.weighting,
              maxMark: item.maximumMark,
              markIncrements: item.markIncrements,
            }));
            const firstDesc = Array.isArray(cached.description)
              ? cached.description[0] || {}
              : {};
            projectStore.setEditProjectDetail(fromEditProjectId, {
              ...cached,
              description: [
                {
                  ...firstDesc,
                  assessment: nextAssessment,
                },
              ],
            });
          }
        }

        // Show success message and redirect back
        message.success('Assessment criteria saved successfully');
        history.back();
      })
      .catch((err) => {
        console.error('Validation failed:', err);
        message.error('Please fix all validation errors before saving');
      });
  };

  const validateWeightings = () => {
    // Calculate total weighting for selected elements only.
    // Treat weighting=0 as effectively not selected.
    let totalWeighting = 0;
    selectedElements.forEach((elementId) => {
      const fieldName = `weighting_${elementId}`;
      const fieldValue = form.getFieldValue(fieldName);
      const num = Number(fieldValue || 0);
      if (num > 0) totalWeighting += num;
    });

    if (totalWeighting > 0 && totalWeighting !== 100) {
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
        <Alert
          type="info"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          message="Note: Criteria with 0% weighting are treated as not added and will not be saved."
        />
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
