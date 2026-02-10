import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BrandLogo from "@/components/BrandLogo";
import {
  LogOut, Users, Layout, HelpCircle, FileText, Shield,
  BarChart3, Crown, Clock, UserPlus, Pencil, Trash2, Mail,
  DollarSign, TrendingUp, AlertTriangle
} from "lucide-react";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import FormSubmissionsPanel from "@/components/admin/FormSubmissionsPanel";

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  plan: string;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  max_pages: number;
  max_live_pages: number;
  max_campaigns: number;
  created_at: string;
}

interface InfoRequest {
  id: string;
  first_name: string;
  email: string;
  created_at: string;
}

const PLAN_LIMITS: Record<string, { max_pages: number; max_live_pages: number; max_campaigns: number }> = {
  trial: { max_pages: 3, max_live_pages: 1, max_campaigns: 1 },
  starter: { max_pages: 25, max_live_pages: 25, max_campaigns: 50 },
  pro: { max_pages: 999999, max_live_pages: 999999, max_campaigns: 999999 },
  enterprise: { max_pages: 999999, max_live_pages: 999999, max_campaigns: 999999 },
};

const planBadgeVariant = (plan: string) => {
  switch (plan) {
    case "trial": return "secondary";
    case "starter": return "default";
    case "pro": return "default";
    case "enterprise": return "outline";
    default: return "secondary";
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, checkingAuth, handleLogout } = useAuth(true);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editTrialDays, setEditTrialDays] = useState("");
  const [savingUser, setSavingUser] = useState(false);

  // Beta questions
  const [infoRequests, setInfoRequests] = useState<InfoRequest[]>([]);
  const [infoRequestCount, setInfoRequestCount] = useState(0);
  const [betaEmailDialogOpen, setBetaEmailDialogOpen] = useState(false);
  const [betaEmailTarget, setBetaEmailTarget] = useState<InfoRequest | null>(null);
  const [betaEmailSubject, setBetaEmailSubject] = useState("");
  const [betaEmailBody, setBetaEmailBody] = useState("");
  const [sendingBetaEmail, setSendingBetaEmail] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers();
      fetchInfoRequests();
    }
  }, [user, isAdmin]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers((data as UserProfile[]) || []);
    } catch (err: any) {
      toast({ title: "Error loading users", description: err.message, variant: "destructive" });
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchInfoRequests = async () => {
    try {
      const { data, error, count } = await supabase
        .from("info_requests")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });
      if (error) throw error;
      setInfoRequests(data || []);
      setInfoRequestCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching info requests:", error.message);
    }
  };

  const openEditUser = (profile: UserProfile) => {
    setEditingUser(profile);
    setEditPlan(profile.plan);
    setEditTrialDays("");
    setEditUserOpen(true);
  };

  const saveUserChanges = async () => {
    if (!editingUser) return;
    setSavingUser(true);
    try {
      const limits = PLAN_LIMITS[editPlan] || PLAN_LIMITS.trial;
      const updateData: any = {
        plan: editPlan,
        max_pages: limits.max_pages,
        max_live_pages: limits.max_live_pages,
        max_campaigns: limits.max_campaigns,
      };

      // If extending trial, set new trial_ends_at
      if (editTrialDays && parseInt(editTrialDays) > 0) {
        const daysToAdd = parseInt(editTrialDays);
        const baseDate = editingUser.trial_ends_at ? new Date(editingUser.trial_ends_at) : new Date();
        baseDate.setDate(baseDate.getDate() + daysToAdd);
        updateData.trial_ends_at = baseDate.toISOString();
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", editingUser.id);

      if (error) throw error;
      toast({ title: "User updated" });
      setEditUserOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingUser(false);
    }
  };

  const sendBetaEmail = async () => {
    if (!betaEmailTarget) return;
    setSendingBetaEmail(true);
    try {
      const { error } = await supabase.functions.invoke("send-beta-info-email", {
        body: {
          to: betaEmailTarget.email,
          firstName: betaEmailTarget.first_name,
          subject: betaEmailSubject,
          body: betaEmailBody,
        },
      });
      if (error) throw error;
      toast({ title: "Email sent!" });
      setBetaEmailDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error sending email", description: err.message, variant: "destructive" });
    } finally {
      setSendingBetaEmail(false);
    }
  };

  const getTrialStatus = (profile: UserProfile) => {
    if (profile.plan !== "trial") return null;
    if (!profile.trial_ends_at) return "no trial set";
    const end = new Date(profile.trial_ends_at);
    const now = new Date();
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return "expired";
    if (daysLeft === 0) return "expires today";
    return `${daysLeft} days left`;
  };

  // Computed stats
  const totalUsers = users.length;
  const trialUsers = users.filter(u => u.plan === "trial").length;
  const activeTrials = users.filter(u => {
    if (u.plan !== "trial" || !u.trial_ends_at) return false;
    return new Date(u.trial_ends_at) > new Date();
  }).length;
  const expiredTrials = users.filter(u => {
    if (u.plan !== "trial" || !u.trial_ends_at) return false;
    return new Date(u.trial_ends_at) <= new Date();
  }).length;
  const paidUsers = users.filter(u => u.plan === "starter" || u.plan === "pro").length;
  const starterUsers = users.filter(u => u.plan === "starter").length;
  const proUsers = users.filter(u => u.plan === "pro").length;
  const enterpriseUsers = users.filter(u => u.plan === "enterprise").length;
  const estimatedMRR = (starterUsers * 29) + (proUsers * 59);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Admin privileges required.</p>
          <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-8" />
            <Badge variant="outline" className="text-xs"><Shield className="w-3 h-3 mr-1" />Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
              <Layout className="w-4 h-4 mr-2" />
              User Dashboard
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-2" />Overview</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users</TabsTrigger>
            <TabsTrigger value="beta-questions">
              <HelpCircle className="w-4 h-4 mr-2" />
              Beta Questions {infoRequestCount > 0 && <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary">{infoRequestCount}</span>}
            </TabsTrigger>
            <TabsTrigger value="form-submissions"><FileText className="w-4 h-4 mr-2" />Form Submissions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1"><Users className="w-4 h-4" /><span className="text-sm">Total Users</span></div>
                <p className="text-3xl font-bold text-foreground">{totalUsers}</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1"><DollarSign className="w-4 h-4" /><span className="text-sm">Est. MRR</span></div>
                <p className="text-3xl font-bold text-foreground">${estimatedMRR}</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1"><Crown className="w-4 h-4" /><span className="text-sm">Paid Users</span></div>
                <p className="text-3xl font-bold text-foreground">{paidUsers}</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1"><Clock className="w-4 h-4" /><span className="text-sm">Active Trials</span></div>
                <p className="text-3xl font-bold text-foreground">{activeTrials}</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Plan Distribution</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trial (active)</span>
                    <span className="font-medium text-foreground">{activeTrials}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" />Trial (expired)</span>
                    <span className="font-medium text-foreground">{expiredTrials}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Starter ($29/mo)</span>
                    <span className="font-medium text-foreground">{starterUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pro ($59/mo)</span>
                    <span className="font-medium text-foreground">{proUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Enterprise</span>
                    <span className="font-medium text-foreground">{enterpriseUsers}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Revenue Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Starter revenue</span>
                    <span className="font-medium text-foreground">${starterUsers * 29}/mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pro revenue</span>
                    <span className="font-medium text-foreground">${proUsers * 59}/mo</span>
                  </div>
                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Total MRR</span>
                    <span className="text-lg font-bold text-primary">${estimatedMRR}/mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trial → Paid conversion</span>
                    <span className="font-medium text-foreground">
                      {totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Users</h2>
                <p className="text-muted-foreground">Manage users, plans, and trials.</p>
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Trial Status</TableHead>
                      <TableHead>Limits</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.email || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{profile.full_name || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={planBadgeVariant(profile.plan) as any} className="capitalize">
                            {profile.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {profile.plan === "trial" ? (
                            <span className={`text-sm ${
                              getTrialStatus(profile) === "expired" ? "text-destructive font-medium" :
                              getTrialStatus(profile)?.includes("1 day") ? "text-amber-500" :
                              "text-muted-foreground"
                            }`}>
                              {getTrialStatus(profile)}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {profile.max_pages >= 999999 ? "∞" : profile.max_pages} pages / {profile.max_campaigns >= 999999 ? "∞" : profile.max_campaigns} campaigns
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => openEditUser(profile)}>
                            <Pencil className="w-3 h-3 mr-1" />Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Beta Questions Tab */}
          <TabsContent value="beta-questions" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Beta Questions</h2>
              <p className="text-muted-foreground">People who expressed interest via the beta signup form.</p>
            </div>
            {infoRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No signups yet.</p>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>First Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {infoRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.first_name}</TableCell>
                        <TableCell>{req.email}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(req.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setBetaEmailTarget(req);
                              setBetaEmailSubject("Personalized page info");
                              setBetaEmailBody(`Hi ${req.first_name},\n\nThanks for signing up to learn more about Personalized Pages. The platform is currently in Beta but will be released soon at discounted pricing.\n\nHow it works\n\n1. Log in and select a landing page template\n2. Upload your email list\n3. We generate a personalized landing page for every contact\n4. Send your campaign using your existing sales or automation platform\n\nThat's it. No custom builds. No one-off pages. Just fast, scalable personalization.\n\nI will send you an email once the platform is publicly available soon.\n\nTake care,\nPaul\n\nPersonalized.Pages`);
                              setBetaEmailDialogOpen(true);
                            }}
                          >
                            <Mail className="w-3.5 h-3.5 mr-1.5" />Send Email
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Form Submissions Tab */}
          <TabsContent value="form-submissions" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Form Submissions</h2>
              <p className="text-muted-foreground mb-6">View all form submissions from your landing pages.</p>
            </div>
            <FormSubmissionsPanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
            <DialogDescription>{editingUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial (2 weeks, 1 live page, 1 campaign)</SelectItem>
                  <SelectItem value="starter">Starter ($29/mo — 25 pages, 50 campaigns)</SelectItem>
                  <SelectItem value="pro">Pro ($59/mo — Unlimited)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (Unlimited, custom)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editPlan === "trial" && (
              <div className="space-y-2">
                <Label>Extend Trial (days)</Label>
                <Input
                  type="number"
                  min="0"
                  value={editTrialDays}
                  onChange={(e) => setEditTrialDays(e.target.value)}
                  placeholder="e.g. 7"
                />
                <p className="text-xs text-muted-foreground">
                  Current trial ends: {editingUser?.trial_ends_at
                    ? new Date(editingUser.trial_ends_at).toLocaleDateString()
                    : "not set"}
                </p>
              </div>
            )}

            <div className="bg-muted rounded-lg p-3 text-sm">
              <p className="font-medium text-foreground mb-1">Plan limits:</p>
              <p className="text-muted-foreground">
                {PLAN_LIMITS[editPlan]?.max_pages >= 999999 ? "Unlimited" : PLAN_LIMITS[editPlan]?.max_pages} pages,{" "}
                {PLAN_LIMITS[editPlan]?.max_campaigns >= 999999 ? "Unlimited" : PLAN_LIMITS[editPlan]?.max_campaigns} campaigns
              </p>
            </div>

            <Button onClick={saveUserChanges} className="w-full" disabled={savingUser}>
              {savingUser ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Beta Email Dialog */}
      <Dialog open={betaEmailDialogOpen} onOpenChange={setBetaEmailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Email to {betaEmailTarget?.first_name}</DialogTitle>
            <DialogDescription>Send a follow-up email to {betaEmailTarget?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={betaEmailSubject} onChange={(e) => setBetaEmailSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea value={betaEmailBody} onChange={(e) => setBetaEmailBody(e.target.value)} rows={10} />
            </div>
            <Button onClick={sendBetaEmail} className="w-full" disabled={sendingBetaEmail}>
              {sendingBetaEmail ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
