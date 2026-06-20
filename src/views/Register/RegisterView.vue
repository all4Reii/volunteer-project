<template>
  <div class="register-view">
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="我的报名" name="my">
        <el-table :data="myRegistrations" border stripe v-loading="loading" empty-text="暂无报名记录">
          <el-table-column prop="id" label="编号" width="60" />
          <el-table-column label="活动" min-width="160">
            <template #default="{ row }">
              <el-link type="primary" @click="$router.push(`/activity/${row.activityId}`)">活动#{{ row.activityId }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="姓名" width="100" />
          <el-table-column prop="phone" label="手机号" width="120" />
          <el-table-column prop="registerTime" label="报名时间" width="170">
            <template #default="{ row }">{{ formatTime(row.registerTime) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="报名审核" name="audit">
        <el-table :data="pendingRegistrations" border stripe v-loading="loading" empty-text="暂无待审核报名">
          <el-table-column prop="id" label="编号" width="60" />
          <el-table-column label="活动" min-width="140">
            <template #default="{ row }">
              <el-link type="primary" @click="$router.push(`/activity/${row.activityId}`)">活动#{{ row.activityId }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="姓名" width="100" />
          <el-table-column prop="phone" label="手机号" width="120" />
          <el-table-column prop="registerTime" label="报名时间" width="170">
            <template #default="{ row }">{{ formatTime(row.registerTime) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default>
              <el-tag type="warning">待审核</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button type="success" size="small" @click="approve(row.id)">通过</el-button>
              <el-button type="danger" size="small" @click="reject(row.id)">拒绝</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'RegisterView',
  setup() {
    const store = useStore()
    const activeTab = ref('my')
    const loading = computed(() => store.state.loading)
    const registrations = computed(() => store.state.registrations)

    onMounted(async () => {
      await store.dispatch('fetchRegistrations')
      await store.dispatch('fetchActivities')
    })

    const currentUserId = computed(() => store.state.currentUser?.id)
    const myRegistrations = computed(() =>
      registrations.value.filter(r => r.userId === currentUserId.value)
    )
    const pendingRegistrations = computed(() =>
      registrations.value.filter(r => r.status === 'pending')
    )

    const formatTime = (t) => new Date(t).toLocaleString('zh-CN')
    const statusType = (s) => s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : 'warning'
    const statusText = (s) => s === 'approved' ? '已通过' : s === 'rejected' ? '已拒绝' : '待审核'

    const approve = async (id) => {
      await ElMessageBox.confirm('确认通过该报名？', '审核确认', { type: 'success' })
      await store.dispatch('approveRegistration', { id, data: { status: 'approved' } })
      ElMessage.success('已通过')

      // 自动添加服务记录
      const reg = registrations.value.find(r => r.id === id)
      if (reg) {
        const act = store.state.activities.find(a => a.id == reg.activityId)
        await store.dispatch('addServiceRecord', {
          userId: reg.userId,
          userName: reg.userName,
          activityId: reg.activityId,
          activityTitle: act ? act.title : ('活动#' + reg.activityId),
          hours: 0,
          date: new Date().toISOString().slice(0, 10),
          status: 'approved',
          remark: ''
        })
      }
    }

    const reject = async (id) => {
      await ElMessageBox.confirm('确认拒绝该报名？', '审核确认', { type: 'warning' })
      await store.dispatch('approveRegistration', { id, data: { status: 'rejected' } })
      ElMessage.warning('已拒绝')
    }

    const onTabChange = () => store.dispatch('fetchRegistrations')

    return { activeTab, myRegistrations, pendingRegistrations, loading, formatTime, statusType, statusText, approve, reject, onTabChange }
  }
}
</script>
