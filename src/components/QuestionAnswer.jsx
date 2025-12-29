import React from 'react'
import Result from './Result'

const QuestionAnswer = ({ scrollToAns, result }) => {

    return (
        <>

            <div ref={scrollToAns} className="container h-110 overflow-y-auto scrollbar-dark scroll-smooth">

                <div className='text-zinc-300'>
                    <ul className=''> 
                        {result.map((item, index) => (

                            <div key={`q-${index}`} className={item.type === 'q' ? 'flex justify-end ' : ''}>
                                {
                                    item.type === 'q' ? (
                                        <li key={`q-${index}`} className="text-right w-fit bg-zinc-700  flex p-3 rounded-tl-3xl rounded-br-3xl rounded-bl-3xl ">
                                            <Result res={item.text} totalResult={1} index={index} type={item.type} />
                                        </li>
                                    ) : (
                                        item.text.map((resItem, resIndex) => (
                                            <li key={`a-${index}-${resIndex}`} className="text-left leading-normal">

                                                <Result res={resItem} totalResult={item.text.length} index={resIndex} type={item.type} />
                                            </li>
                                        ))
                                    )
                                }
                             </div>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}

export default QuestionAnswer