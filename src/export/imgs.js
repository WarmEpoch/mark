import { defineStore } from 'pinia'

export const useImgsStore = defineStore('imgs',{
    state: () => ({
        raw: [],
    }),
})