import { create } from 'zustand'

// export const createLoggerSlice = (set, get) => ({

export const useNotificationSlice = (set, get) => ({
    messages: [],
    addMessage: (message) => {
        const id = Date.now()
        const newMessage = {
            ...message,
            id,
            timestamp: new Date(),
            ttl: message.ttl || 5
        }

        set(state => ({
            messages: [...state.messages, newMessage]
        }))

        // Remove message after TTL
        setTimeout(() => {
            set(state => ({
                messages: state.messages.filter(msg => msg.id !== id)
            }))
        }, newMessage.ttl * 1000)
    },
    removeMessage: (id) => {
        set(state => ({
            messages: state.messages.filter(msg => msg.id !== id)
        }))
    }
})

export default useNotificationSlice