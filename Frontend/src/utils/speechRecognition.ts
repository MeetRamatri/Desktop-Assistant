type SpeechRecognitionResultCallback = (transcript: string) => void;
type SpeechRecognitionErrorCallback = (message: string) => void;

interface BrowserSpeechRecognitionEvent {
  results: ArrayLike<{
    0: {
      transcript: string;
    };
    isFinal: boolean;
    length: number;
  }>;
}

interface BrowserSpeechRecognitionErrorEvent {
  error: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface BrowserSpeechRecognitionConstructor {
  new (): BrowserSpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  'audio-capture': 'Microphone not found. Please check your microphone and try again.',
  'network': 'Speech recognition needs a network connection right now.',
  'not-allowed': 'Microphone permission was denied. Please allow microphone access and try again.',
  'service-not-allowed': 'Speech recognition is blocked on this device.',
  'no-speech': 'No speech was detected. Please try again.',
  'aborted': 'Voice recording was cancelled.',
};

function getSpeechRecognitionConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported() {
  return Boolean(getSpeechRecognitionConstructor());
}

export async function requestMicrophoneAccess() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone access is not supported in this app.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => track.stop());
}

export function createSpeechRecognition(
  onResult: SpeechRecognitionResultCallback,
  onError: SpeechRecognitionErrorCallback,
  onStop?: () => void,
) {
  const RecognitionConstructor = getSpeechRecognitionConstructor();

  if (!RecognitionConstructor) {
    throw new Error('Speech recognition is not supported in this app.');
  }

  const recognition = new RecognitionConstructor();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || '')
      .join(' ')
      .trim();

    onResult(transcript);
  };

  recognition.onerror = (event) => {
    onError(ERROR_MESSAGES[event.error] || 'Speech recognition failed. Please try again.');
  };

  recognition.onend = () => {
    onStop?.();
  };

  return recognition;
}
