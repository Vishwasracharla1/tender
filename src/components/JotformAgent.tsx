import { useEffect } from 'react';

export function JotformAgent() {
  useEffect(() => {
    // NEVER load on tender-overview page
    if (window.location.pathname === '/tender-overview') {
      return;
    }

    // Picture-in-Picture handler
    const sanitizeVariables = (url: string, width: number, height: number) => {
      try {
        const sanitizedUrl = new URL(url);
        const sanitizedUrlString = sanitizedUrl.toString();
        const sanitizedWidth = parseInt(String(width));
        const sanitizedHeight = parseInt(String(height));
        return { url: sanitizedUrlString, width: sanitizedWidth, height: sanitizedHeight };
      } catch (e) {
        console.error('Error sanitizing variables', e);
        return { url: '', width: 0, height: 0 };
      }
    };

    const handlePictureInPictureRequest = async (event: MessageEvent) => {
      if (event.data.type !== 'jf-request-pip-window') {
        return;
      }

      const { _url, _width, _height } = event.data;
      const { url, width, height } = sanitizeVariables(_url, _width, _height);

      if (url === '' || width === 0 || height === 0) {
        return;
      }

      if ('documentPictureInPicture' in window) {
        // return if already in picture in picture mode
        const pipWindow = (window as any).documentPictureInPicture?.window;
        if (pipWindow) {
          return;
        }

        const pipWindowInstance = await (window as any).documentPictureInPicture.requestWindow({
          width,
          height,
          disallowReturnToOpener: true,
        });

        // copy styles from main window to pip window
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules]
              .map((rule: any) => rule.cssText)
              .join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            pipWindowInstance.document.head.appendChild(style);
          } catch (e) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = styleSheet.type || 'text/css';
            if (styleSheet.media) {
              link.media = typeof styleSheet.media === 'string' ? styleSheet.media : styleSheet.media.mediaText;
            }
            if (styleSheet.href) {
              link.href = styleSheet.href;
            }
            pipWindowInstance.document.head.appendChild(link);
          }
        });

        pipWindowInstance.document.body.innerHTML = `<iframe src="${url}" style="width: ${width}px; height: ${height}px;" allow="microphone *; display-capture *;"></iframe>`;

        return { success: true, isActive: false };
      }
    };

    window.addEventListener('message', handlePictureInPictureRequest);

    // Load Jotform Agent script
    const src = 'https://www.noupe.com/s/umd/e89c43e3274/for-embedded-agent.js';
    
    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      // Script already exists, just initialize if AgentInitializer is available
      if ((window as any).AgentInitializer) {
        (window as any).AgentInitializer.init({
          agentRenderURL: 'https://www.noupe.com/agent/019aa102d4617a04838c7ef39132e1adea2b',
          rootId: 'JotformAgent-019aa102d4617a04838c7ef39132e1adea2b',
          formID: '019aa102d4617a04838c7ef39132e1adea2b',
          contextID: '019aa108d8ca7d70a9ed8d2aeedc09625947',
          initialContext: '',
          queryParams: [
            'skipWelcome=1',
            'maximizable=1',
            'skipWelcome=1',
            'maximizable=1',
            'isNoupeAgent=1',
            'isNoupeLogo=1',
            'noupeSelectedColor=%232563EB',
            'B_VARIANT_AUTO_OPEN_NOUPE_CHATBOT_ON_PREVIEW=34462',
          ],
          domain: 'https://www.noupe.com',
          isDraggable: false,
          background: 'linear-gradient(180deg, #6C73A8 0%, #6C73A8 100%)',
          buttonBackgroundColor: '#0066C3',
          buttonIconColor: '#FFFFFF',
          inputTextColor: '#01105C',
          variant: false,
          customizations: {
            greeting: 'Yes',
            greetingMessage: 'Hi! How can I assist you?',
            openByDefault: 'No',
            pulse: 'Yes',
            position: 'right',
            autoOpenChatIn: '0',
            layout: 'square',
          },
          isVoice: false,
          isVoiceWebCallEnabled: false,
        });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = function () {
      if ((window as any).AgentInitializer) {
        (window as any).AgentInitializer.init({
          agentRenderURL: 'https://www.noupe.com/agent/019aa102d4617a04838c7ef39132e1adea2b',
          rootId: 'JotformAgent-019aa102d4617a04838c7ef39132e1adea2b',
          formID: '019aa102d4617a04838c7ef39132e1adea2b',
          contextID: '019aa108d8ca7d70a9ed8d2aeedc09625947',
          initialContext: '',
          queryParams: [
            'skipWelcome=1',
            'maximizable=1',
            'skipWelcome=1',
            'maximizable=1',
            'isNoupeAgent=1',
            'isNoupeLogo=1',
            'noupeSelectedColor=%232563EB',
            'B_VARIANT_AUTO_OPEN_NOUPE_CHATBOT_ON_PREVIEW=34462',
          ],
          domain: 'https://www.noupe.com',
          isDraggable: false,
          background: 'linear-gradient(180deg, #6C73A8 0%, #6C73A8 100%)',
          buttonBackgroundColor: '#0066C3',
          buttonIconColor: '#FFFFFF',
          inputTextColor: '#01105C',
          variant: false,
          customizations: {
            greeting: 'Yes',
            greetingMessage: 'Hi! How can I assist you?',
            openByDefault: 'No',
            pulse: 'Yes',
            position: 'right',
            autoOpenChatIn: '0',
            layout: 'square',
          },
          isVoice: false,
          isVoiceWebCallEnabled: false,
        });
      }
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      window.removeEventListener('message', handlePictureInPictureRequest);
      // Don't remove script on unmount as it might be used by other components
    };
  }, []);

  return null; // This component doesn't render anything
}

