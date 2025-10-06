export function toArr(v: any): any[] {
  return Array.isArray(v) ? v : (v ? [v] : []);
}

export function asSlideObjs(arr: any): any[] {
  return toArr(arr).map(s => typeof s === 'string' ? { text: s } : s);
}

export function asTextObjs(arr: any): any[] {
  return toArr(arr).map(s => typeof s === 'string' ? { text: s } : s);
}

export function normalizePack(raw: any) {
  const d = raw || {};
  return {
    month: d.month || '',
    theme: d.theme || '',
    reels: toArr(d.reels).map((r: any) => ({
      hook: r?.hook ?? '',
      truth: r?.truth ?? '',
      cta: r?.cta ?? ''
    })),
    carousels: toArr(d.carousels ?? d.carousel).map((c: any) => ({
      slides: asSlideObjs(c?.slides),
      caption: typeof c?.caption === 'string' ? c.caption : (c?.caption?.text ?? '')
    })),
    captions: asTextObjs(d.captions),
    emails: toArr(d.emails).map((e: any) => ({
      subject: e?.subject ?? '',
      body: e?.body ?? ''
    })),
    dm_scripts: toArr(d.dm_scripts ?? d.dms).map((x: any) => ({
      nurture: x?.nurture ?? '',
      follow_up: x?.follow_up ?? '',
      cta: x?.cta ?? ''
    })),
    swipe_of_the_month: d.swipe_of_the_month ?? d.swipe ?? null,
    cta_bank: asTextObjs(d.cta_bank ?? d.ctas),
    hashtags: toArr(d.hashtags).map((h: any) => (typeof h === 'string' ? h : '')),
  };
}
