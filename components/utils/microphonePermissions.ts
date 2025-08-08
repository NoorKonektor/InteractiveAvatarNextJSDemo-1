export const checkMicrophonePermission = async (): Promise<boolean> => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  try {
    // Check if navigator.permissions is available
    if ('permissions' in navigator) {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return permission.state === 'granted';
    }

    // Fallback: try to access microphone directly
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch {
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking microphone permission:', error);
    return false;
  }
};

export const requestMicrophonePermission = async (): Promise<MediaStream | null> => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    throw new Error('Navigator not available in this environment');
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('MediaDevices API not supported');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    return stream;
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    throw error;
  }
};

export const getMicrophonePermissionError = (error: any): string => {
  switch (error.name) {
    case 'NotAllowedError':
      return 'Microphone access was denied. Please allow microphone access in your browser settings and try again.';
    case 'NotFoundError':
      return 'No microphone found. Please connect a microphone and try again.';
    case 'NotReadableError':
      return 'Microphone is being used by another application. Please close other applications using the microphone and try again.';
    case 'OverconstrainedError':
      return 'Microphone constraints could not be satisfied. Please try again.';
    case 'SecurityError':
      return 'Microphone access is blocked by security settings. Please enable microphone access for this site.';
    default:
      return 'Unable to access microphone. Please check your browser settings and try again.';
  }
};
