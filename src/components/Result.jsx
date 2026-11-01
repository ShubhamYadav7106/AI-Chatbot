
import { useEffect, useState } from "react";
import { checkHeading, replaceStar } from "./FormatText"
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/light";
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';








import ReactMarkdown from 'react-markdown'

const Result = ({ res, totalResult, index,type }) => {

    const [heading, setHeading] = useState(false);
    const [answer, setAnswer] = useState(res);
 

    useEffect(() => {
        if (checkHeading(res)) {
            setHeading(true);
            setAnswer(replaceStar(res))
        }

    }, [res])

    const renderer = {
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              {...props}
              children={String(children).replace(/\n$/, '')}
              language={match[1]}
              style={dark}
              PreTag="div"
            />
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          );
        },
      };

    return (
        <>
            {
                index == 0 && totalResult > 1 ? <span className="pt-2 text-xl block text-white">{answer}</span> :
                    heading ? <span className={"pt-2 text-lg block text-white"} >{answer}</span>
                        : <span className={type=='q'?'pl-1':'pl-5'} >
                            <ReactMarkdown components={renderer} >{answer}</ReactMarkdown>
                        </span>
            }


        </>
    )
}

export default Result
