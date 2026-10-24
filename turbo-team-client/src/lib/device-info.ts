interface UserAgentData {
  getHighEntropyValues: (
    hints: string[],
  ) => Promise<{ model?: string; platform?: string; mobile?: boolean }>;
}

const getDeviceHeaders = async (): Promise<Record<string, string>> => {
  if (typeof navigator === 'undefined') return {};

  const userAgentData = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
  if (!userAgentData) return {};

  try {
    const data = await userAgentData.getHighEntropyValues(['model', 'platform', 'mobile']);

    return {
      ...(data.model ? { 'X-Device-Model': data.model } : {}),
      ...(data.platform ? { 'X-Device-Platform': data.platform } : {}),
      ...(typeof data.mobile === 'boolean' ? { 'X-Device-Mobile': String(data.mobile) } : {}),
    };
  } catch (error) {
    console.warn('Unable to read device model from User-Agent Client Hints', error);
    return {};
  }
};

export { getDeviceHeaders };
