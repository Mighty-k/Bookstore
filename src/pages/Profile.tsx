import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Lock,
  LogOut,
  Edit,
  X,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Switch from "../components/ui/Switch";
import Modal from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer-not-to-say";
}

interface Address {
  id: string;
  type: "home" | "work" | "other";
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  recommendations: boolean;
  reviewReminders: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  sessionTimeout: boolean;
}

const Profile: React.FC = () => {
  const { user, updateProfile, logout, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || "John Doe",
    email: user?.email || "john@example.com",
    phone: user?.phone || "+1 (555) 123-4567",
    dateOfBirth: "1990-01-01",
    gender: "male",
  });

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      type: "home",
      fullName: "John Doe",
      street: "123 Main St",
      apartment: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "United States",
      phone: "+1 (555) 123-4567",
      isDefault: true,
    },
    {
      id: "2",
      type: "work",
      fullName: "John Doe",
      street: "456 Market St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "United States",
      phone: "+1 (555) 987-6543",
      isDefault: false,
    },
  ]);

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      orderUpdates: true,
      promotions: true,
      newsletter: false,
      recommendations: true,
      reviewReminders: true,
    });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    theme: "light",
    currency: "USD",
  });

  const tabs = [
    { id: "profile", label: "Profile Information" },
    { id: "addresses", label: "Addresses" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
    { id: "preferences", label: "Preferences" },
  ];

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  const handleAddAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      type: "home",
      fullName: profileData.name,
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      phone: profileData.phone,
      isDefault: addresses.length === 0,
    };
    setAddresses([...addresses, newAddress]);
    toast.success("New address added");
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
    toast.success("Address deleted");
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    );
    toast.success("Default address updated");
  };

  const handleDeleteAccount = () => {
    // Implement account deletion logic
    toast.error("Account deletion is not available in demo");
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <Card className="sticky top-24">
              {/* Profile Summary */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {profileData.avatar ? (
                      <img
                        src={profileData.avatar}
                        alt={profileData.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
                    <Camera size={16} />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profileData.name}
                </h2>
                <p className="text-sm text-gray-500">{profileData.email}</p>
              </div>

              {/* Navigation Tabs (Mobile/Desktop) */}
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Logout Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center justify-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={18} className="mr-2" />
                  Sign Out
                </button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card>
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Profile Information
                    </h2>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        leftIcon={<Edit size={16} />}
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          leftIcon={<X size={16} />}
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          leftIcon={<Save size={16} />}
                          onClick={handleSaveProfile}
                        >
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        leftIcon={<User size={16} />}
                      />

                      <Input
                        label="Email Address"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        leftIcon={<Mail size={16} />}
                      />

                      <Input
                        label="Phone Number"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        leftIcon={<Phone size={16} />}
                      />

                      <Input
                        label="Date of Birth"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            dateOfBirth: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          value={profileData.gender}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              gender: e.target.value as any,
                            })
                          }
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">
                            Prefer not to say
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Password Change Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Password & Security
                      </h3>

                      {!showPasswordForm ? (
                        <Button
                          variant="outline"
                          leftIcon={<Lock size={16} />}
                          onClick={() => setShowPasswordForm(true)}
                        >
                          Change Password
                        </Button>
                      ) : (
                        <div className="space-y-4 max-w-md">
                          <Input
                            label="Current Password"
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                currentPassword: e.target.value,
                              })
                            }
                            rightIcon={
                              <button
                                onClick={() =>
                                  setShowPasswords({
                                    ...showPasswords,
                                    current: !showPasswords.current,
                                  })
                                }
                              >
                                {showPasswords.current ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                            }
                          />

                          <Input
                            label="New Password"
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                            rightIcon={
                              <button
                                onClick={() =>
                                  setShowPasswords({
                                    ...showPasswords,
                                    new: !showPasswords.new,
                                  })
                                }
                              >
                                {showPasswords.new ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                            }
                          />

                          <Input
                            label="Confirm New Password"
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                            rightIcon={
                              <button
                                onClick={() =>
                                  setShowPasswords({
                                    ...showPasswords,
                                    confirm: !showPasswords.confirm,
                                  })
                                }
                              >
                                {showPasswords.confirm ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                            }
                          />

                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              onClick={handleChangePassword}
                            >
                              Update Password
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowPasswordForm(false);
                                setPasswordData({
                                  currentPassword: "",
                                  newPassword: "",
                                  confirmPassword: "",
                                });
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-red-600 mb-4">
                        Danger Zone
                      </h3>
                      <Button
                        variant="outline"
                        leftIcon={<Trash2 size={16} />}
                        onClick={() => setShowDeleteConfirm(true)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Saved Addresses
                    </h2>
                    <Button
                      variant="primary"
                      leftIcon={<MapPin size={16} />}
                      onClick={handleAddAddress}
                    >
                      Add New Address
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <Badge
                              variant={
                                address.type === "home"
                                  ? "primary"
                                  : address.type === "work"
                                    ? "info"
                                    : "secondary"
                              }
                            >
                              {address.type}
                            </Badge>
                            {address.isDefault && (
                              <Badge variant="success" className="ml-2">
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button className="p-1 text-gray-500 hover:text-blue-600">
                              <Edit size={16} />
                            </button>
                            <button
                              className="p-1 text-gray-500 hover:text-red-600"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <p className="font-medium text-gray-900">
                          {address.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.street}
                          {address.apartment && `, ${address.apartment}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.country}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {address.phone}
                        </p>

                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                          >
                            Set as default
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Notification Settings
                  </h2>

                  <div className="space-y-4">
                    <Switch
                      label="Order Updates"
                      description="Receive notifications about your order status"
                      checked={notificationSettings.orderUpdates}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          orderUpdates: e.target.checked,
                        })
                      }
                    />

                    <Switch
                      label="Promotions & Deals"
                      description="Get notified about special offers and discounts"
                      checked={notificationSettings.promotions}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          promotions: e.target.checked,
                        })
                      }
                    />

                    <Switch
                      label="Newsletter"
                      description="Receive our weekly newsletter with new releases and recommendations"
                      checked={notificationSettings.newsletter}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          newsletter: e.target.checked,
                        })
                      }
                    />

                    <Switch
                      label="Personalized Recommendations"
                      description="Get book recommendations based on your reading history"
                      checked={notificationSettings.recommendations}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          recommendations: e.target.checked,
                        })
                      }
                    />

                    <Switch
                      label="Review Reminders"
                      description="Receive reminders to review books you've purchased"
                      checked={notificationSettings.reviewReminders}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          reviewReminders: e.target.checked,
                        })
                      }
                    />
                  </div>

                  <div className="mt-6">
                    <Button
                      variant="primary"
                      onClick={() =>
                        toast.success("Notification settings saved")
                      }
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Security Settings
                  </h2>

                  <div className="space-y-4">
                    <Switch
                      label="Two-Factor Authentication"
                      description="Add an extra layer of security to your account"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          twoFactorAuth: e.target.checked,
                        })
                      }
                    />

                    <Switch
                      label="Login Alerts"
                      description="Get notified of new logins to your account"
                      checked={securitySettings.loginAlerts}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          loginAlerts: e.target.checked,
                        })
                      }
                    />

                    <Switch
                      label="Session Timeout"
                      description="Automatically log out after 30 minutes of inactivity"
                      checked={securitySettings.sessionTimeout}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          sessionTimeout: e.target.checked,
                        })
                      }
                    />
                  </div>

                  <div className="mt-8">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Recent Sessions
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            Chrome on Windows
                          </p>
                          <p className="text-sm text-gray-500">
                            San Francisco, CA • 2 hours ago
                          </p>
                        </div>
                        <Badge variant="success">Current</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            Safari on iPhone
                          </p>
                          <p className="text-sm text-gray-500">
                            San Francisco, CA • 2 days ago
                          </p>
                        </div>
                        <button className="text-sm text-red-600 hover:text-red-800">
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      variant="primary"
                      onClick={() => toast.success("Security settings saved")}
                    >
                      Save Settings
                    </Button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Preferences
                  </h2>

                  <div className="space-y-6 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            language: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="zh">中文</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <div className="flex gap-4">
                        <button
                          onClick={() =>
                            setPreferences({ ...preferences, theme: "light" })
                          }
                          className={`flex-1 p-3 border rounded-lg flex items-center justify-center gap-2 ${
                            preferences.theme === "light"
                              ? "border-blue-600 bg-blue-50 text-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <Sun size={18} />
                          Light
                        </button>
                        <button
                          onClick={() =>
                            setPreferences({ ...preferences, theme: "dark" })
                          }
                          className={`flex-1 p-3 border rounded-lg flex items-center justify-center gap-2 ${
                            preferences.theme === "dark"
                              ? "border-blue-600 bg-blue-50 text-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <Moon size={18} />
                          Dark
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={preferences.currency}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            currency: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="CAD">CAD (C$)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      variant="primary"
                      onClick={() => toast.success("Preferences saved")}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Account"
        size="sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Are you sure you want to delete your account?
          </h3>

          <p className="text-sm text-gray-500 mb-6">
            This action cannot be undone. All your data will be permanently
            removed.
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
