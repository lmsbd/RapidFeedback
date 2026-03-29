import React from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { history } from 'umi';
import styles from './BackButton.module.less';

const BackButton = ({
  onClick,
  text = 'Back',
  className = '',
  customPath,
  ...props
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (customPath) {
      history.push(customPath);
    } else {
      window.history.back();
    }
  };

  return (
    <Button
      icon={<ArrowLeftOutlined />}
      onClick={handleClick}
      className={`${styles.backButton} ${className}`}
      {...props}
      size={'large'}
    >
      {text}
    </Button>
  );
};

export default BackButton;
