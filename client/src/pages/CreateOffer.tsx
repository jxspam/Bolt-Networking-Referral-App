import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { InsertCampaign } from "../../../shared/schema";
import { Lightbulb, Check, ExternalLink } from "lucide-react";

interface CampaignFormData {
  businessId: number;
  name: string;
  description: string;
  serviceArea: string;
  rewardPerConversion: string;
  maxBudget: string;
  startDate: string;
  endDate: string;
  postcode: {
    start: string;
    end: string;
  };
}

export default function CreateOffer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Omit<InsertCampaign, 'businessId'> & { businessId: number | null }>({
    businessId: 1, // Default business ID
    name: "",
    description: "",
    serviceArea: "",
    rewardPerConversion: "",
    maxBudget: "",
    startDate: "",
    endDate: "",
    postcode: {
      start: "",
      end: ""
    }
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const createCampaignMutation = useMutation({
    mutationFn: async (data: Omit<InsertCampaign, 'businessId'> & { businessId: number | null }) => {
      const { data: campaignData, error } = await supabase.from('campaigns').insert([
        {
          business_id: data.businessId,
          name: data.name,
          description: data.description,
          service_area: data.serviceArea,
          reward_per_conversion: data.rewardPerConversion,
          max_budget: data.maxBudget,
          start_date: new Date(data.startDate).toISOString(),
          end_date: new Date(data.endDate).toISOString(),
          postcode: data.postcode,
        }
      ]).select();

      if (error) {
        throw new Error(error.message);
      }
      return campaignData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({
        title: "Campaign Created",
        description: "Your new campaign has been successfully created and launched.",
      });
      setLocation("/campaigns");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof InsertCampaign, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePostcodeChange = (field: "start" | "end", value: string) => {
    setFormData(prev => ({
      ...prev,
      postcode: {
        ...prev.postcode,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault();
    
    if (!asDraft && !agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms and Conditions before launching the campaign.",
        variant: "destructive",
      });
      return;
    }

    if (asDraft) {
      toast({
        title: "Draft Saved",
        description: "Your campaign has been saved as a draft.",
      });
      return;
    }

    createCampaignMutation.mutate(formData);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Offer</h1>
          <p className="text-gray-600">Fill out the form below to create a new campaign offer for your business</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Name */}
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Enter your business name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                {/* Campaign Name */}
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name</Label>
                  <Input
                    id="campaignName"
                    placeholder="Enter campaign name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                {/* Service Area */}
                <div className="space-y-2">
                  <Label htmlFor="serviceArea">Service Area</Label>
                  <Select value={formData.serviceArea} onValueChange={(value) => handleInputChange("serviceArea", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home-services">Home Services</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Select from dropdown</p>
                </div>

                {/* Postcode Range */}
                <div className="space-y-2">
                  <Label>Postcode range</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Start postcode"
                      value={formData.postcode.start}
                      onChange={(e) => handlePostcodeChange("start", e.target.value)}
                    />
                    <span className="flex items-center text-gray-500">to</span>
                    <Input
                      placeholder="End postcode"
                      value={formData.postcode.end}
                      onChange={(e) => handlePostcodeChange("end", e.target.value)}
                    />
                  </div>
                </div>

                {/* Reward per Conversion */}
                <div className="space-y-2">
                  <Label htmlFor="reward">Reward per Conversion ($)</Label>
                  <Input
                    id="reward"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.rewardPerConversion}
                    onChange={(e) => handleInputChange("rewardPerConversion", e.target.value)}
                  />
                  <p className="text-sm text-gray-500">Amount paid to referrers for each successful conversion</p>
                </div>

                {/* Max Budget */}
                <div className="space-y-2">
                  <Label htmlFor="budget">Max Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.maxBudget}
                    onChange={(e) => handleInputChange("maxBudget", e.target.value)}
                  />
                  <p className="text-sm text-gray-500">Maximum amount to spend on this campaign</p>
                </div>
              </div>

              {/* Campaign Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Campaign Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe your offer and what constitutes a successful conversion"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              {/* Campaign Duration */}
              <div className="space-y-2">
                <Label>Campaign Duration</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">Start Date</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">End Date</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <a href="#" className="text-blue-500 hover:underline">
                    Terms and Conditions
                  </a>
                </Label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={(e) => handleSubmit(e, true)}
                >
                  Save as Draft
                </Button>
                <Button 
                  type="submit"
                  disabled={createCampaignMutation.isPending}
                >
                  {createCampaignMutation.isPending ? "Creating..." : "Launch Campaign"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Tips for Successful Campaigns
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Set competitive rewards to attract more referrers
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Clearly define what constitutes a successful conversion
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Target specific geographic areas for better results
              </li>
              <li className="flex items-start text-blue-600">
                <ExternalLink className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <a href="#" className="hover:underline">
                  Learn more about campaign optimization
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
