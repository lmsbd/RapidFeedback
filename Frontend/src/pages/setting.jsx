import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Input, Modal, message } from 'antd';
import userStore from '@/stores/userStore';
import { updateProfile, changePassword } from '@/apis/setting';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import DefaultAvatar from '@/components/DefaultAvatar/DefaultAvatar';
import styles from './setting.module.less';

const ROLE_MAP = {
  1: 'Admin',
  2: 'Marker',
};

const Setting = observer(() => {
  const { userName, email, role } = userStore;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '' });
  const [saving, setSaving] = useState(false);

  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

  const handleOpenPwdModal = () => {
    setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPwdModalOpen(true);
  };

  const handleChangePassword = async () => {
    if (!pwdForm.oldPassword) {
      message.warning('Please enter your old password');
      return;
    }
    if (!pwdForm.newPassword) {
      message.warning('Please enter a new password');
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      message.warning('New password must be at least 6 characters');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      message.warning('New passwords do not match');
      return;
    }

    setPwdSaving(true);
    try {
      const res = await changePassword({
        userId: userStore.userId,
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword,
      });

      if (res.code === 200) {
        message.success('Password changed successfully');
        setPwdModalOpen(false);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error('Failed to change password');
    } finally {
      setPwdSaving(false);
    }
  };

  const handleEdit = () => {
    setForm({ username: userName || '' });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    if (!form.username.trim()) {
      message.warning('Username cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({
        userId: userStore.userId,
        username: form.username.trim(),
      });

      if (res.code === 200) {
        const updated = res?.data || { username: form.username.trim() };
        userStore.updateProfile(updated);
        message.success('Profile updated successfully');
        setEditing(false);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  /* ---- View Mode (Screen 1) ---- */
  if (!editing) {
    return (
      <div className={styles.settingPage}>
        <DashboardHeader title="Settings" />
        <div className={styles.mainContent}>
          <div className={styles.profileSection}>
            <div className={styles.avatarRow}>
              <span className={styles.fieldLabel}>Avatar</span>
              <div className={styles.avatarCircle}>
                <DefaultAvatar name={userName} size={72} />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Username</span>
              <div className={styles.fieldValue}>{userName || '-'}</div>
            </div>

            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Email</span>
              <div className={styles.fieldValue}>{email || '-'}</div>
            </div>

            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Role</span>
              <div className={styles.fieldValue}>{ROLE_MAP[role] || '-'}</div>
            </div>

            <div className={styles.actionRow}>
              <Button className={styles.editButton} onClick={handleEdit}>
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Edit Mode (Screen 2) ---- */
  return (
    <div className={styles.settingPage}>
      <DashboardHeader title="Settings" />
      <div className={styles.mainContent}>
        <div className={styles.profileSection}>
          <div className={styles.avatarRow}>
            <span className={styles.fieldLabel}>Avatar</span>
            <div className={styles.avatarCircle}>
              <DefaultAvatar name={form.username || userName} size={72} />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Username</span>
            <Input
              className={styles.fieldInput}
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="Enter username"
            />
          </div>

          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Email</span>
            <div className={styles.fieldValue}>{email || '-'}</div>
          </div>

          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Role</span>
            <div className={styles.fieldValue}>{ROLE_MAP[role] || '-'}</div>
          </div>

          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Password</span>
            <Button className={styles.changePasswordButton} onClick={handleOpenPwdModal}>
              Change Password
            </Button>
          </div>

          <div className={styles.editActionRow}>
            <Button className={styles.cancelButton} onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              className={styles.saveButton}
              loading={saving}
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      <Modal
        title="Change Password"
        open={pwdModalOpen}
        onCancel={() => setPwdModalOpen(false)}
        footer={null}
        destroyOnClose
        width={420}
        className={styles.pwdModal}
      >
        <div className={styles.pwdForm}>
          <div className={styles.pwdField}>
            <label className={styles.pwdLabel}>Old Password</label>
            <Input.Password
              value={pwdForm.oldPassword}
              onChange={(e) => setPwdForm((prev) => ({ ...prev, oldPassword: e.target.value }))}
              placeholder="Enter old password"
            />
          </div>
          <div className={styles.pwdField}>
            <label className={styles.pwdLabel}>New Password</label>
            <Input.Password
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          <div className={styles.pwdField}>
            <label className={styles.pwdLabel}>Confirm New Password</label>
            <Input.Password
              value={pwdForm.confirmPassword}
              onChange={(e) => setPwdForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Re-enter new password"
            />
          </div>
          <div className={styles.pwdActions}>
            <Button onClick={() => setPwdModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              loading={pwdSaving}
              onClick={handleChangePassword}
              className={styles.pwdSubmitButton}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default Setting;
