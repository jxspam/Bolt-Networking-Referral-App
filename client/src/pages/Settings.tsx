import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Bell, Shield, CreditCard } from "lucide-react";
import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/user-profile";

export default function Settings() {
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [marketingUpdates, setMarketingUpdates] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userProfile = await getUserProfile();
      if (userProfile) {
        setUser(userProfile);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);
  const handleSaveSettings = async () => {
    if (!user) return;    
    
    try {
      const updatedProfile = await updateUserProfile({
        first_name: user.first_name,
        last_name: user.last_name,
        avatar: user.avatar
      });

      if (!updatedProfile) {
        toast({
          title: "Error Saving Settings",
          description: "There was an error updating your preferences.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Settings Saved",
          description: "Your preferences have been updated successfully.",
        });
        setUser(updatedProfile);
      }
    } catch (err) {
      toast({
        title: "Error Saving Settings",
        description: "There was an error updating your preferences.",
        variant: "destructive",
      });
      console.error("Error updating profile:", err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.avatar || undefined} />
                  <AvatarFallback>{user?.first_name?.[0] ?? ''}{user?.last_name?.[0] ?? ''}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="text-sm text-gray-600 mt-1">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={user?.first_name || ''} onChange={(e) => setUser(user ? { ...user, first_name: e.target.value } : null)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={user?.last_name || ''} onChange={(e) => setUser(user ? { ...user, last_name: e.target.value } : null)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={user?.email || ''} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" defaultValue="Premium referrer specializing in home services and technology sectors." />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Email Notification Types</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="newReferrals" defaultChecked />
                      <Label htmlFor="newReferrals" className="text-sm">
                        New referral notifications
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="weeklyReports" 
                        checked={weeklyReports}
                        onCheckedChange={(checked) => setWeeklyReports(checked === true)}
                      />
                      <Label htmlFor="weeklyReports" className="text-sm">
                        Weekly earnings summary
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="marketingUpdates"
                        checked={marketingUpdates}
                        onCheckedChange={(checked) => setMarketingUpdates(checked === true)}
                      />
                      <Label htmlFor="marketingUpdates" className="text-sm">
                        Marketing updates and promotions
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="disputeAlerts" defaultChecked />
                      <Label htmlFor="disputeAlerts" className="text-sm">
                        Dispute and fraud alerts
                      </Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Receive urgent notifications via SMS</p>
                  </div>
                  <Switch 
                    checked={smsNotifications} 
                    onCheckedChange={setSmsNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security & Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                </div>
                <Button variant="outline" size="sm">Update Password</Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="twoFactor" />
                  <Label htmlFor="twoFactor" className="text-sm">
                    Enable two-factor authentication
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="loginAlerts" defaultChecked />
                  <Label htmlFor="loginAlerts" className="text-sm">
                    Send login alerts to my email
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment & Billing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Bank Account</Label>
                  <Input id="bankAccount" defaultValue="**** **** **** 1234" readOnly />
                  <p className="text-sm text-gray-600">Primary account for receiving payouts</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">                    <Label htmlFor="payoutFrequency">Payout Frequency</Label>
                    <select id="payoutFrequency" name="payoutFrequency" aria-label="Payout Frequency" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Weekly</option>
                      <option>Bi-weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumPayout">Minimum Payout Amount</Label>
                    <Input id="minimumPayout" defaultValue="$50.00" />
                  </div>
                </div>

                <Button variant="outline" size="sm">Update Payment Method</Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
