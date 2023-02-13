<template>
    <el-tabs v-model="menuId" type="card" @tab-click="handleClick">
        <el-tab-pane label="小米徕卡" name="Mi"></el-tab-pane>
        <el-tab-pane label="极简单一" name="Frame"></el-tab-pane>
        <el-tab-pane label="边框简字" name="Jamb"></el-tab-pane>
        <el-tab-pane label="边框标志" name="Flag"></el-tab-pane>
    </el-tabs>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps(['id'])
const menuId = props.id
const handleClick = (tab) => {
    tab.props.name === 'Mi' ? router.replace({ path: '/' }) : router.replace({ path: tab.props.name })
}
</script>

<style>
.el-tabs__header{
    margin: 0;
}
.el-tabs--card>.el-tabs__header{
    border-bottom: none;
}
.el-tabs--card>.el-tabs__header .el-tabs__nav{
    border: none;
}
.el-tabs__item.is-active{
    background-color: var(--el-color-primary-light-3);
    color: var(--el-bg-color);
}
.el-tabs--card>.el-tabs__header .el-tabs__item{
    border: none;
}
</style>