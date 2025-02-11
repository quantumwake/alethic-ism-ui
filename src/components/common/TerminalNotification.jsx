import React, { useEffect } from 'react'
import { useStore } from '../../store'

const TerminalNotificationQueue = () => {
    const theme = useStore(state => state.getCurrentTheme())
    const messages = useMessageStore(state => state.messages)
    const removeMessage = useMessageStore(state => state.removeMessage)

    const levelStyles = {
        info: theme.button.info,
        warning: theme.button.warning,
        error: theme.button.danger,
        success: theme.button.success,
        'validation-failed': theme.button.danger
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
            {messages.map(message => (
                <div
                    key={message.id}
                    className={`
            font-mono rounded-none border ${theme.border}
            p-4 shadow-lg transition-all duration-300 ease-in-out
            ${levelStyles[message.level] || levelStyles.info}
          `}
                >
                    {message.heading && (
                        <div className="font-bold mb-1">{message.heading}</div>
                    )}
                    <div>{message.body}</div>
                </div>
            ))}
        </div>
    )
}

export default TerminalNotificationQueue