import React, { useRef, useState } from 'react';
import { URL } from './MyApi';
import RecentSearch from './RecentSearch';
import QuestionAnswer from './QuestionAnswer';

const MainUi = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState([]);
    const [recentHistory, setRecentHistory] = useState(() => {
        try {
            const history = JSON.parse(localStorage.getItem('history'));
            return Array.isArray(history) ? history : [];
        } catch {
            return [];
        }
    });
    const scrollToAns = useRef();
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState('');

    const askHandler = async (message = query) => {
        const payloadData = message.trim();
        if (!payloadData || loader) {
            return;
        }

        if (message === query) {
            if (localStorage.getItem('history')) {
                let history;
                try {
                    history = JSON.parse(localStorage.getItem('history'));
                } catch {
                    history = [];
                }
                history = Array.isArray(history) ? history.slice(0, 19) : [];
                history = [message, ...history].map((item) => (
                    item.charAt(0).toUpperCase() + item.slice(1).trim()
                ));
                history = [...new Set(history)];
                localStorage.setItem('history', JSON.stringify(history));
                setRecentHistory(history);
            } else {
                localStorage.setItem('history', JSON.stringify([message]));
                setRecentHistory([message]);
            }
        }

        const payload = {
            contents: [
                {
                    parts: [{ text: payloadData }]
                }
            ],
            generationConfig: {
                thinkingConfig: {
                    thinkingLevel: 'low',
                },
            },
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        setLoader(true);
        setError('');
        try {
            const response = await fetch(URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            if (!response.ok) {
                let detail = '';
                try {
                    const errorBody = await response.json();
                    const apiError = errorBody.error;
                    detail = typeof apiError === 'string'
                        ? apiError
                        : apiError?.message || errorBody.message || '';
                } catch {
                    // The proxy may return a plain-text error.
                }
                throw new Error(detail || `Request failed (HTTP ${response.status}).`);
            }
            const responseData = await response.json();
            let dataString = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!dataString) {
                throw new Error('Gemini returned an empty response.');
            }
            dataString = dataString.split("* ").map((item) => item.trim());

            setResult((previous) => [
                ...previous,
                { type: 'q', text: payloadData },
                { type: 'a', text: dataString },
            ]);
            setQuery('');

            setTimeout(() => {
                if (scrollToAns.current) {
                    scrollToAns.current.scrollTop = scrollToAns.current.scrollHeight;
                }
            }, 500);
        } catch (error) {
            const message = error.name === 'AbortError'
                ? 'The request timed out after 1 minute. Check your connection and try again.'
                : error.message || 'Unable to get a response. Please try again.';
            console.error('Error fetching data:', error);
            setError(message);
        } finally {
            clearTimeout(timeout);
            setLoader(false);
        }
    };

    const isEnter = (e) => {
        if (e.key === 'Enter') {
            void askHandler();
        }
    };

    const selectHistory = (historyItem) => {
        void askHandler(historyItem);
    };

    return (
        <div className='grid grid-cols-5 h-screen  font-[Verdana]'>
            <div className='col-span-1  bg-zinc-800 text-white text-center'>
            {
                <RecentSearch recentHistory={recentHistory} setRecentHistory={setRecentHistory} setSelectedHistory={selectHistory} />
            }
        </div>
            <div className='col-span-4 p-10'>
                <h1 className='text-center text-4xl
                bg-clip-text text-transparent bg-gradient-to-r from-pink-700 to-violet-700'
                >Hello User, Ask me Anything</h1>

                {error ? <p role="alert" className="text-center text-red-400 my-2">{error}</p> : null}
                {
                    loader ? <div role="status" className='text-center my-2'>
                        <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200  animate-spin dark:text-gray-600 fill-purple-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div> : null
                }
        {
            <QuestionAnswer scrollToAns={scrollToAns} result={result}  />
        }

                
                <div className='m-auto mt-5 p-3 w-1/2 flex rounded-3xl text-white border border-zinc-400'>
                    <input
                        onKeyDown={isEnter}
                        className='outline-none w-full h-full'
                        type='text'
                        placeholder='Ask me anything'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button className='cursor-pointer' onClick={() => void askHandler()}>Ask</button>
                </div>
            </div>
        </div>
    );
};

export default MainUi;