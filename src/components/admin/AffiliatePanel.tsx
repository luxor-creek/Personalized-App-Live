import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  UserPlus, ArrowLeft, Copy, ExternalLink, DollarSign,
  Users, TrendingUp, Link2, Pencil,
} from "lucide-react";

interface Affiliate {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  affiliate_code: string;
  commission_rate: number;
  payout_method: string | null;
  payout_details: string | null;
  status: string;
  total_earned: number;
  total_paid: number;
  created_at: string;
}

interface Referral {
  id: string;
  affiliate_id: string;
  referred_user_id: string | null;
  referred_email: string | null;
  plan: string | null;
  subscription_amount: number;
  commission_amount: number;
  status: string;
  converted_at: string;
  paid_at: string | null;
}

const statusColor = (s: string) => {
  switch (s) {
    case "active": return "default";
    case "paused": return "secondary";
    case "terminated": return "destructive";
    case "confirmed": return "default";
    case "paid": return "outline";
    case "pending": return "secondary";
    case "cancelled": return "destructive";
    default: return "secondary";
  }
};

const AffiliatePanel = () => {
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  // Add affiliate dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRate, setNewRate] = useState("30");
  const [newPayout, setNewPayout] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit affiliate dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editAffiliate, setEditAffiliate] = useState<Affiliate | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editRate, setEditRate] = useState("");
  const [editPayout, setEditPayout] = useState("");
  const [editPayoutDetails, setEditPayoutDetails] = useState("");
  const [saving, setSaving] = useState(false);

  // Add referral dialog
  const [addReferralOpen, setAddReferralOpen] = useState(false);
  const [refEmail, setRefEmail] = useState("");
  const [refPlan, setRefPlan] = useState("starter");
  const [refAmount, setRefAmount] = useState("29");
  const [addingReferral, setAddingReferral] = useState(false);

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAffiliates((data as Affiliate[]) || []);
    } catch (err: any) {
      toast({ title: "Error loading affiliates", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async (affiliateId: string) => {
    setLoadingReferrals(true);
    try {
      const { data, error } = await supabase
        .from("affiliate_referrals")
        .select("*")
        .eq("affiliate_id", affiliateId)
        .order("converted_at", { ascending: false });
      if (error) throw error;
      setReferrals((data as Referral[]) || []);
    } catch (err: any) {
      toast({ title: "Error loading referrals", description: err.message, variant: "destructive" });
    } finally {
      setLoadingReferrals(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast({ title: "Name and email required", variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase.from("affiliates").insert({
        name: newName.trim(),
        email: newEmail.trim(),
        commission_rate: parseFloat(newRate) || 30,
        payout_method: newPayout || null,
      });
      if (error) throw error;
      toast({ title: "Affiliate added" });
      setAddOpen(false);
      setNewName("");
      setNewEmail("");
      setNewRate("30");
      setNewPayout("");
      fetchAffiliates();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (a: Affiliate) => {
    setEditAffiliate(a);
    setEditStatus(a.status);
    setEditRate(String(a.commission_rate));
    setEditPayout(a.payout_method || "");
    setEditPayoutDetails(a.payout_details || "");
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editAffiliate) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("affiliates")
        .update({
          status: editStatus,
          commission_rate: parseFloat(editRate) || 30,
          payout_method: editPayout || null,
          payout_details: editPayoutDetails || null,
        })
        .eq("id", editAffiliate.id);
      if (error) throw error;
      toast({ title: "Affiliate updated" });
      setEditOpen(false);
      fetchAffiliates();
      if (selectedAffiliate?.id === editAffiliate.id) {
        setSelectedAffiliate({ ...selectedAffiliate, status: editStatus, commission_rate: parseFloat(editRate) || 30, payout_method: editPayout || null, payout_details: editPayoutDetails || null });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddReferral = async () => {
    if (!selectedAffiliate || !refEmail.trim()) return;
    setAddingReferral(true);
    try {
      const amount = parseFloat(refAmount) || 0;
      const commission = amount * (selectedAffiliate.commission_rate / 100);
      const { error } = await supabase.from("affiliate_referrals").insert({
        affiliate_id: selectedAffiliate.id,
        referred_email: refEmail.trim(),
        plan: refPlan,
        subscription_amount: amount,
        commission_amount: commission,
        status: "confirmed",
      });
      if (error) throw error;

      // Update totals
      await supabase
        .from("affiliates")
        .update({ total_earned: (selectedAffiliate.total_earned || 0) + commission })
        .eq("id", selectedAffiliate.id);

      toast({ title: "Referral added" });
      setAddReferralOpen(false);
      setRefEmail("");
      setRefPlan("starter");
      setRefAmount("29");
      fetchReferrals(selectedAffiliate.id);
      fetchAffiliates();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAddingReferral(false);
    }
  };

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/auth?ref=${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!" });
  };

  const openDrilldown = (a: Affiliate) => {
    setSelectedAffiliate(a);
    fetchReferrals(a.id);
  };

  // Stats
  const totalAffiliates = affiliates.length;
  const activeAffiliates = affiliates.filter(a => a.status === "active").length;
  const totalCommissions = affiliates.reduce((sum, a) => sum + Number(a.total_earned), 0);
  const totalPaid = affiliates.reduce((sum, a) => sum + Number(a.total_paid), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Drilldown view
  if (selectedAffiliate) {
    const unpaid = Number(selectedAffiliate.total_earned) - Number(selectedAffiliate.total_paid);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedAffiliate(null)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h3 className="text-xl font-bold text-foreground">{selectedAffiliate.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedAffiliate.email}</p>
            </div>
            <Badge variant={statusColor(selectedAffiliate.status) as any} className="capitalize">{selectedAffiliate.status}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => copyLink(selectedAffiliate.affiliate_code)}>
              <Copy className="w-3.5 h-3.5 mr-1.5" />Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={() => openEdit(selectedAffiliate)}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" />Edit
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Commission Rate</p>
            <p className="text-2xl font-bold text-foreground">{selectedAffiliate.commission_rate}%</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Total Earned</p>
            <p className="text-2xl font-bold text-foreground">${Number(selectedAffiliate.total_earned).toFixed(2)}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-2xl font-bold text-foreground">${Number(selectedAffiliate.total_paid).toFixed(2)}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Unpaid Balance</p>
            <p className={`text-2xl font-bold ${unpaid > 0 ? "text-primary" : "text-foreground"}`}>${unpaid.toFixed(2)}</p>
          </div>
        </div>

        {/* Referral link */}
        <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Affiliate Link</p>
            <p className="text-sm font-mono text-foreground">{window.location.origin}/auth?ref={selectedAffiliate.affiliate_code}</p>
          </div>
          <div className="text-xs text-muted-foreground">
            Payout: <span className="capitalize font-medium text-foreground">{selectedAffiliate.payout_method || "Not set"}</span>
          </div>
        </div>

        {/* Referrals table */}
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">Referrals ({referrals.length})</h4>
          <Button size="sm" onClick={() => setAddReferralOpen(true)}>
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />Add Referral
          </Button>
        </div>

        {loadingReferrals ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No referrals yet.</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Paid At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.referred_email || "—"}</TableCell>
                    <TableCell className="capitalize">{r.plan || "—"}</TableCell>
                    <TableCell>${Number(r.subscription_amount).toFixed(2)}/mo</TableCell>
                    <TableCell className="font-medium text-primary">${Number(r.commission_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor(r.status) as any} className="capitalize">{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.converted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.paid_at ? new Date(r.paid_at).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add Referral Dialog */}
        <Dialog open={addReferralOpen} onOpenChange={setAddReferralOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Referral</DialogTitle>
              <DialogDescription>Manually log a referral for {selectedAffiliate.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Referred Email</Label>
                <Input value={refEmail} onChange={e => setRefEmail(e.target.value)} placeholder="user@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={refPlan} onValueChange={setRefPlan}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter ($29/mo)</SelectItem>
                    <SelectItem value="pro">Pro ($59/mo)</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subscription Amount ($/mo)</Label>
                <Input type="number" value={refAmount} onChange={e => setRefAmount(e.target.value)} />
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p className="text-muted-foreground">Commission: <span className="font-medium text-foreground">${((parseFloat(refAmount) || 0) * (selectedAffiliate.commission_rate / 100)).toFixed(2)}/mo</span> ({selectedAffiliate.commission_rate}%)</p>
              </div>
              <Button onClick={handleAddReferral} className="w-full" disabled={addingReferral}>
                {addingReferral ? "Adding..." : "Add Referral"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Affiliate Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Affiliate</DialogTitle>
              <DialogDescription>{editAffiliate?.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Commission Rate (%)</Label>
                <Input type="number" value={editRate} onChange={e => setEditRate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Payout Method</Label>
                <Select value={editPayout} onValueChange={setEditPayout}>
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="wise">Wise</SelectItem>
                    <SelectItem value="wire">Wire Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payout Details</Label>
                <Input value={editPayoutDetails} onChange={e => setEditPayoutDetails(e.target.value)} placeholder="PayPal email or account details" />
              </div>
              <Button onClick={handleSaveEdit} className="w-full" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Affiliates</h2>
          <p className="text-muted-foreground">Manage affiliate partners and track commissions. 30% lifetime commission on every subscription.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />Add Affiliate
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1"><Users className="w-4 h-4" /><span className="text-sm">Total Affiliates</span></div>
          <p className="text-3xl font-bold text-foreground">{totalAffiliates}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1"><TrendingUp className="w-4 h-4" /><span className="text-sm">Active</span></div>
          <p className="text-3xl font-bold text-foreground">{activeAffiliates}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1"><DollarSign className="w-4 h-4" /><span className="text-sm">Total Commissions</span></div>
          <p className="text-3xl font-bold text-foreground">${totalCommissions.toFixed(2)}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1"><DollarSign className="w-4 h-4" /><span className="text-sm">Total Paid Out</span></div>
          <p className="text-3xl font-bold text-foreground">${totalPaid.toFixed(2)}</p>
        </div>
      </div>

      {/* Affiliates table */}
      {affiliates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No affiliates yet. Add your first affiliate partner.</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Earned</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map(a => (
                <TableRow key={a.id} className="cursor-pointer" onClick={() => openDrilldown(a)}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{a.affiliate_code}</code>
                  </TableCell>
                  <TableCell>{a.commission_rate}%</TableCell>
                  <TableCell className="font-medium">${Number(a.total_earned).toFixed(2)}</TableCell>
                  <TableCell>${Number(a.total_paid).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor(a.status) as any} className="capitalize">{a.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => copyLink(a.affiliate_code)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(a)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Affiliate Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Affiliate</DialogTitle>
            <DialogDescription>Create a new affiliate partner. They'll get a unique referral link.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="jane@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Commission Rate (%)</Label>
              <Input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="30" />
            </div>
            <div className="space-y-2">
              <Label>Payout Method</Label>
              <Select value={newPayout} onValueChange={setNewPayout}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="wise">Wise</SelectItem>
                  <SelectItem value="wire">Wire Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted rounded-lg p-3 text-sm">
              <p className="font-medium text-foreground mb-1">How it works:</p>
              <ul className="text-muted-foreground text-xs space-y-1 list-disc list-inside">
                <li>A unique referral code is auto-generated</li>
                <li>They earn {newRate || 30}% commission on every subscription — for life</li>
                <li>Commissions processed 30 days after each purchase</li>
              </ul>
            </div>
            <Button onClick={handleAdd} className="w-full" disabled={adding}>
              {adding ? "Adding..." : "Add Affiliate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog (also accessible from list) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Affiliate</DialogTitle>
            <DialogDescription>{editAffiliate?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Commission Rate (%)</Label>
              <Input type="number" value={editRate} onChange={e => setEditRate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Payout Method</Label>
              <Select value={editPayout} onValueChange={setEditPayout}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="wise">Wise</SelectItem>
                  <SelectItem value="wire">Wire Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payout Details</Label>
              <Input value={editPayoutDetails} onChange={e => setEditPayoutDetails(e.target.value)} placeholder="PayPal email or account details" />
            </div>
            <Button onClick={handleSaveEdit} className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AffiliatePanel;
