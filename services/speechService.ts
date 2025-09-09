const synth = window.speechSynthesis;

export const speak = (text: string, onStart: () => void, onEnd: () => void) => {
  if (synth.speaking) {
    console.error("SpeechSynthesis.speaking");
    return;
  }

  if (text !== "") {
    const utterThis = new SpeechSynthesisUtterance(text);

    utterThis.onstart = () => {
      onStart();
    };

    utterThis.onend = () => {
      onEnd();
    };

    utterThis.onerror = (event) => {
      console.error("SpeechSynthesisUtterance.onerror", event);
      onEnd(); // Ensure speaking state is reset on error
    };

    synth.speak(utterThis);
  }
};

export const cancelSpeech = () => {
    if(synth) {
        synth.cancel();
    }
}
