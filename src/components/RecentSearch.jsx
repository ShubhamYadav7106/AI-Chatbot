import React from 'react'

const RecentSearch = ({ recentHistory, setRecentHistory, setSelectedHistory }) => {
    const clearHistoryHandler = () => {
        localStorage.clear()
        setRecentHistory([])
    }
    const clearSelectedHistory=(selectedHistory)=>{
        console.warn(selectedHistory)
        console.log('1h-->'+recentHistory)
        localStorage.setItem('history', JSON.stringify(recentHistory.filter((item)=>item!==selectedHistory)))
        setRecentHistory(recentHistory.filter((item)=>item!==selectedHistory))
        setSelectedHistory('')
                console.warn(selectedHistory)
                console.log('2h-->'+recentHistory)

    }
    return (
        <>


            <h1 className='text-lg text-zinc-200 flex justify-center my-2'>
                <span>Recent Search</span>
                <button className='p-1 cursor-pointer'
                    onClick={clearHistoryHandler}
                ><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#F3F3F3"><path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z" /></svg></button>
            </h1>
            <ul className='text-left  overflow-auto mt-2 '>
                {
                    recentHistory && recentHistory.map((item, index) => (
                        <div className='flex justify-between pr-3 py-1'>
                            <li key={index} onClick={() => setSelectedHistory(item)} className='truncate pl-7 text-zinc-400 cursor-pointer hover:bg-zinc-700 hover:text-zinc-200 before:content-["•"] before:mr-2 w-full'>{item}</li>
                            <button className='p-1 cursor-pointer
                            hover:-scale-125 transition-all  duration-300 
                           '
                            onClick={()=>clearSelectedHistory(item)}
                            ><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#F3F3F3"><path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z" /></svg></button>
                        </div>
                    ))
                }</ul>
        </>

    )
}

export default RecentSearch