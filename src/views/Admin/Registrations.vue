<template>
  <div class="admin-page">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <span>报名审核管理</span>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="120" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="activityName" label="活动" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button
              type="success"
              size="small"
              :disabled="scope.row.status === 'approved'"
              @click="updateStatus(scope.row, 'approved')"
            >
              通过
            </el-button>
            <el-button
              type="danger"
              size="small"
              :disabled="scope.row.status === 'rejected'"
              @click="updateStatus(scope.row, 'rejected')"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { registrationAPI } from '@/api'
import { ElMessage } from 'element-plus'

export default {
  name: 'AdminRegistrations',
  setup() {
    const list = ref([])
    const loading = ref(false)

    const loadData = async () => {
      loading.value = true
      try {
        const res = await registrationAPI.getList()
        list.value = res.data || []
      } catch (e) {
        ElMessage.error('加载失败')
      } finally {
        loading.value = false
      }
    }

    const updateStatus = async (row, status) => {
      try {
        await registrationAPI.update(row.id, { status })
        ElMessage.success('更新成功')
        loadData()
      } catch (e) {
        ElMessage.error('操作失败')
      }
    }

    const getStatusType = (status) => {
      if (status === 'approved') return 'success'
      if (status === 'rejected') return 'danger'
      return 'warning'
    }

    onMounted(loadData)

    return { list, loading, updateStatus, getStatusType }
  }
}
</script>

<style scoped>
.admin-page { padding: 20px; }
.header { font-weight: bold; }
</style>