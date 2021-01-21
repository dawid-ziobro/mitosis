import { useState, useRef, onMount } from '@jsx-lite/core';

export interface EmbedProps {
  code: string;
}

export default function Embed(props: EmbedProps) {
  const elem = useRef();

  const state = useState({
    scriptsInserted: [],
    scriptsRun: [],

    findAndRunScripts() {
      // TODO: Move this function to standalone one in '@builder.io/utils'
      if (elem && typeof window !== 'undefined') {
        const scripts = elem.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i];
          if (script.src) {
            if (state.scriptsInserted.includes(script.src)) {
              continue;
            }
            state.scriptsInserted.push(script.src);
            const newScript = document.createElement('script');
            newScript.async = true;
            newScript.src = script.src;
            document.head.appendChild(newScript);
          } else if (
            !script.type ||
            [
              'text/javascript',
              'application/javascript',
              'application/ecmascript',
            ].includes(script.type)
          ) {
            if (state.scriptsRun.includes(script.innerText)) {
              continue;
            }
            try {
              state.scriptsRun.push(script.innerText);
              new Function(script.innerText)();
            } catch (error) {
              console.warn('Builder custom code component error:', error);
            }
          }
        }
      }
    },
  });

  onMount(() => {
    state.findAndRunScripts();
  });

  return (
    <div
      ref={elem}
      className={
        'builder-custom-code' +
        (this.props.replaceNodes ? ' replace-nodes' : '')
      }
      innerHTML={props.code}
    ></div>
  );
}