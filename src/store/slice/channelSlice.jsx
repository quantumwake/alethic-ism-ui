export const useChannelSlice = (set, get) => ({

    // channel selectors
    channelInputId: null,
    setChannelInputId: (channelInputId) => set({channelInputId: channelInputId}),

    channelOutputId: null,
    setChannelOutputId: (channelOutputId) => set({channelOutputId: channelOutputId}),

    channelSubscriberId: null,
    setChannelSubscriberId: (channelSubscriberId) => set({channelSubscriberId: channelSubscriberId}),

});

export default useChannelSlice

