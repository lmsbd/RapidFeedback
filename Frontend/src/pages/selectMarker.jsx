import React, { useEffect, useState } from 'react';
import { Table, Button, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';
import { history, useLocation } from 'umi';
import { getAllMarkers } from '@/apis/getAllMarkers';
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
        const res = await getAllMarkers();
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
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'userId', key: 'userId' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (role === 1 ? 'Admin' : 'Marker'),
    },
    { title: 'Name', dataIndex: 'userName', key: 'userName' },
  ];

  const rowSelection = {
    selectedRowKeys: markerStore.selectedMarkerIds,
    onChange: (selectedRowKeys, selectedRows) => {
      markerStore.setSelectedWithDetails(selectedRows);
      //   console.log(JSON.stringify(markerStore.selectedMarkerIds));
    },
  };

  const handleConfirm = () => {
    if (markerStore.selectedMarkerIds.length === 0) {
      message.warning('Please select at least one marker');
      return;
    }

    const selectedIdSet = new Set(markerStore.selectedMarkerIds);
    const selectedRows = (Array.isArray(data) ? data : []).filter((row) =>
      selectedIdSet.has(row?.userId ?? row?.id)
    );
    if (selectedRows.length > 0) {
      markerStore.setSelectedWithDetails(selectedRows);
    }

    const params = new URLSearchParams(location.search);
    const fromManage = params.get('fromManage');
    const fromCreate = params.get('fromCreate');
    const subjectId = params.get('id');

    if (fromManage === 'true' && subjectId) {
      history.push(`/manageSubject/${subjectId}?fromSelection=1`);
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
        rowKey="userId"
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
