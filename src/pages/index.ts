export interface BrandDNA {
  niche: string;
  idealClient: string;
  coreProblem: string;
  coreOutcome: string;
  programName: string;
  programPrice: string;
  currencyMetric: string;
  proofElement: string;
  tone: 'Bold/Direct' | 'Mentor/Warm' | 'Clinical/Expert';
  platforms: string[];
  cta: string;
  complianceNote: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'member' | 'pro' | 'elite' | 'admin';
  brandDNA?: BrandDNA;
  subscription?: {
    tier: string;
    status: 'active' | 'trial' | 'cancelled';
    trialEnds?: Date;
  };
}

export interface ContentAsset {
  id: string;
  type: 'reel' | 'carousel' | 'caption' | 'hashtag' | 'email' | 'dm' | 'cta' | 'swipe';
  title: string;
  baseContent: string;
  personalizedContent?: string;
  month: string;
  saved?: boolean;
  tags?: string[];
}

export interface ContentPack {
  month: string;
  theme: string;
  assets: ContentAsset[];
  releaseDate: Date;
}
