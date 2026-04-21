import React, { useEffect, useState } from 'react';
import { Table, Button, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';
import { history, useLocation } from 'umi';
import { getAllMarkers } from '@/apis/getAllMarkers';
import { getMarkers } from '@/apis/projects';
import styles from './selectStudent.module.less';
import BackButton from '../components/BackButton/BackButton';
const selectMarker = observer(() => {
  const { markerStore } = useStores();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMarkers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(location.search);
        const subjectId = params.get('subjectId');
        const projectId =
          params.get('projectId') ?? params.get('fromEditProject');

        const res =
          projectId != null
            ? await getMarkers({ projectId })
            : subjectId != null
              ? await getMarkers({ subjectId })
              : await getAllMarkers();
        // console.log(res);
        if (res.code === 200) {
          setData(res.data);
        } else {
          message.error(res.msg || 'Failed to fetch markers');
        }
      } catch (err) {
        message.error('Request error');
      } finally {
        setLoading(false);
      }
    };
    fetchMarkers();
  }, [location.search]);

  const columns = [
    {
      title: 'ID',
      key: 'userId',
      render: (_, record) => record?.userId ?? record?.id,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (role === 1 ? 'Admin' : 'Marker'),
    },
    { title: 'Name', dataIndex: 'userName', key: 'userName' },
  ];

  const rowSelection = {
    selectedRowKeys: markerStore.selectedMarkerIds.map((id) => String(id)),
    onChange: (selectedRowKeys, selectedRows) => {
      markerStore.setSelected(selectedRowKeys);
      markerStore.upsertSelectedMarkers(selectedRows);
    },
  };

  const handleConfirm = () => {
    if (markerStore.selectedMarkerIds.length === 0) {
      message.warning('Please select at least one marker');
      return;
    }

    const selectedIdSet = new Set(
      markerStore.selectedMarkerIds
        .map((id) => markerStore.normalizeId(id))
        .filter((id) => id != null)
    );
    const selectedRows = (Array.isArray(data) ? data : []).filter((row) =>
      selectedIdSet.has(markerStore.normalizeId(row?.userId ?? row?.id))
    );
    markerStore.setSelectedWithDetails(selectedRows);

    const params = new URLSearchParams(location.search);
    const fromManage = params.get('fromManage');
    const fromCreate = params.get('fromCreate');
    const subjectId = params.get('id');

    if (fromManage === 'true' && subjectId) {
      const draftKey = `manageSubjectSelectionDraft_${subjectId}`;
      const rawDraft = sessionStorage.getItem(draftKey);
      if (rawDraft) {
        try {
          const parsedDraft = JSON.parse(rawDraft);
          sessionStorage.setItem(
            draftKey,
            JSON.stringify({
              ...parsedDraft,
              markerIds: markerStore.selectedMarkerIds.slice(),
            })
          );
        } catch (error) {
          console.warn('Failed to sync manage subject marker draft', error);
        }
      }
      history.push(`/manageSubject/${subjectId}?fromSelection=1&source=markers`);
      return;
    }

    if (fromCreate === 'true') {
      history.push('/createSubject');
      return;
    }

    history.go(-1);
  };

  return (
    <div>
      <div className={styles.header}>
        <BackButton />
      </div>
      <h2>Select Markers</h2>
      <Table
        rowKey={(record) => String(record?.userId ?? record?.id)}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        loading={loading}
      />
      <Button
        type="primary"
        className={styles.confirmButton}
        onClick={handleConfirm}
        style={{ marginTop: 16 }}
      >
        Confirm
      </Button>
    </div>
  );
});

export default selectMarker;
