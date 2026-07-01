<template>
  <div class="register-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>{{ pageTitle }}</h2>
    </div>

    <!-- 志愿者：我的报名 -->
    <template v-if="!isAdmin">
      <div class="section-header">
        <span>我的报名记录</span>
        <el-button type="primary" size="small" @click="$router.push('/activities')">
          + 报名新活动
        </el-button>
      </div>
      
      <el-table 
        :data="myRegistrations" 
        border 
        stripe 
        v-loading="loading" 
        empty-text="暂无报名记录，快去报名活动吧！"
        style="width: 100%"
      >
        <el-table-column prop="id" label="编号" width="70" />
        <el-table-column label="活动" min-width="180">
          <template #default="{ row }">
            <el-link type="primary" @click="$router.push(`/activity/${row.activityId}`)">
              {{ getActivityTitle(row.activityId) }}
            </el-link>
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
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'pending'" 
              type="danger" 
              size="small" 
              @click="cancelRegistration(row)"
            >
              取消报名
            </el-button>
            <el-tag v-else type="info" size="small">不可取消</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <!-- 管理员：报名审核 -->
    <template v-else>
      <el-tabs v-model="activeTab" @tab-change="onTabChange">
        <el-tab-pane label="全部报名" name="all">
          <el-table 
            :data="allRegistrations" 
            border 
            stripe 
            v-loading="loading" 
            empty-text="暂无报名记录"
            style="width: 100%"
          >
            <el-table-column prop="id" label="编号" width="70" />
            <el-table-column label="活动" min-width="180">
              <template #default="{ row }">
                <el-link type="primary" @click="$router.push(`/activity/${row.activityId}`)">
                  {{ getActivityTitle(row.activityId) }}
                </el-link>
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
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <!-- 1️⃣ 待审核 -->
                <template v-if="row.status === 'pending'">
                  <el-button type="success" size="small" @click="approve(row)">通过</el-button>
                  <el-button type="danger" size="small" @click="reject(row)">拒绝</el-button>
                </template>

                <!-- 2️⃣ 已取消：空 -->
                <template v-else-if="row.status === 'cancelled'">
                  <!-- 什么都不显示 -->
                </template>

                <!-- 3️⃣ 其他状态 -->
                <template v-else>
                  <el-tag 
                    :type="row.status === 'approved' ? 'success' : 'danger'" 
                    size="small"
                  >
                    {{ row.status === 'approved' ? '已通过' : '已拒绝' }}
                  </el-tag>
                </template>

              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="待审核" name="pending">
          <el-table 
            :data="pendingRegistrations" 
            border 
            stripe 
            v-loading="loading" 
            empty-text="暂无待审核报名"
            style="width: 100%"
          >
            <el-table-column prop="id" label="编号" width="70" />
            <el-table-column label="活动" min-width="180">
              <template #default="{ row }">
                <el-link type="primary" @click="$router.push(`/activity/${row.activityId}`)">
                  {{ getActivityTitle(row.activityId) }}
                </el-link>
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
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="success" size="small" @click="approve(row)">通过</el-button>
                <el-button type="danger" size="small" @click="reject(row)">拒绝</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="已通过" name="approved">
          <el-table 
            :data="approvedRegistrations" 
            border 
            stripe 
            v-loading="loading" 
            empty-text="暂无已通过的报名"
            style="width: 100%"
          >
            <el-table-column prop="id" label="编号" width="70" />
            <el-table-column label="活动" min-width="180">
              <template #default="{ row }">
                <el-link type="primary" @click="$router.push(`/activity/${row.activityId}`)">
                  {{ getActivityTitle(row.activityId) }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="userName" label="姓名" width="100" />
            <el-table-column prop="phone" label="手机号" width="120" />
            <el-table-column prop="registerTime" label="报名时间" width="170">
              <template #default="{ row }">{{ formatTime(row.registerTime) }}</template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default>
                <el-tag type="success">已通过</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="已拒绝" name="rejected">
          <el-table 
            :data="rejectedRegistrations" 
            border 
            stripe 
            v-loading="loading" 
            empty-text="暂无已拒绝的报名"
            style="width: 100%"
          >
            <el-table-column prop="id" label="编号" width="70" />
            <el-table-column label="活动" min-width="180">
              <template #default="{ row }">
                <el-link type="primary" @click="$router.push(`/activity/${row.activityId}`)">
                  {{ getActivityTitle(row.activityId) }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="userName" label="姓名" width="100" />
            <el-table-column prop="phone" label="手机号" width="120" />
            <el-table-column prop="registerTime" label="报名时间" width="170">
              <template #default="{ row }">{{ formatTime(row.registerTime) }}</template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default>
                <el-tag type="danger">已拒绝</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
//import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'RegisterView',
  setup() {
    const store = useStore()
    //const router = useRouter()
    const activeTab = ref('all')
    const loading = computed(() => store.state.loading)

    // 用户信息
    const currentUser = computed(() => store.state.currentUser)
    const isAdmin = computed(() => store.getters.isAdmin)

    // 页面标题
    const pageTitle = computed(() => 
      isAdmin.value ? '报名审核管理' : '我的报名'
    )

    // 获取数据
    const registrations = computed(() => store.state.registrations || [])
    const activities = computed(() => store.state.activities || [])

    // 获取活动标题
    const getActivityTitle = (activityId) => {
      const activity = activities.value.find(a => a.id == activityId)
      return activity ? activity.title : `活动 #${activityId}`
    }

    // 志愿者的报名记录（只显示自己的）
    const myRegistrations = computed(() => {
      const userId = currentUser.value?.id
      if (!userId) return []
      return registrations.value.filter(r => r.userId == userId)
    })

    // 管理员看到的所有记录
    const allRegistrations = computed(() => registrations.value)
    const pendingRegistrations = computed(() => 
      registrations.value.filter(r => r.status === 'pending')
    )
    const approvedRegistrations = computed(() => 
      registrations.value.filter(r => r.status === 'approved')
    )
    const rejectedRegistrations = computed(() => 
      registrations.value.filter(r => r.status === 'rejected')
    )

    // 格式化时间
    const formatTime = (t) => {
      if (!t) return '-'
      return new Date(t).toLocaleString('zh-CN')
    }

    // 状态样式 管理员的操作
    const statusType = (s) => {
      const map = {
        'approved': 'success',
        'pending': 'warning',
        'rejected': 'danger'
      }
      return map[s] || 'info'
    }

    const statusText = (s) => {
      const map = {
        'approved': '已通过',
        'pending': '待审核',
        'rejected': '已拒绝',
        'cancelled': '已取消'
      }
      return map[s] || s
    }

    // 取消报名（志愿者）
    const cancelRegistration = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要取消 "${getActivityTitle(row.activityId)}" 的报名吗？`,
          '取消报名确认',
          { 
            type: 'warning',
            confirmButtonText: '确认取消',
            cancelButtonText: '再想想'
          }
        )

        await store.dispatch('cancelRegistration', {
          id: row.id,
          data: { status: 'cancelled' }
        })

        ElMessage.success('已取消报名')
        await store.dispatch('fetchRegistrations')

      } catch (error) {
        if (error !== 'cancel') {
          console.error('取消报名失败:', error)
          ElMessage.error('操作失败，请重试')
        }
      }
    }

    // 审核通过（管理员）
    const approve = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确认通过 ${row.userName} 的报名申请？`,
          '审核确认',
          { 
            type: 'success',
            confirmButtonText: '确认通过',
            cancelButtonText: '取消'
          }
        )

        await store.dispatch('approveRegistration', { 
          id: row.id, 
          data: { status: 'approved' } 
        })

        ElMessage.success(`已通过 ${row.userName} 的报名`)
        await store.dispatch('fetchRegistrations')

        // 自动添加服务记录
        // const activity = activities.value.find(a => a.id == row.activityId)
        // if (activity) {
        //   await store.dispatch('addServiceRecord', {
        //     userId: row.userId,
        //     userName: row.userName,
        //     activityId: row.activityId,
        //     activityTitle: activity.title,
        //     hours: activity.hours,
        //     date: activity.date,
        //     status: 'approved',
        //     remark: '审核通过自动生成'
        //   })
        // }

      } catch (error) {
        if (error !== 'cancel') {
          console.error('审核通过失败:', error)
          ElMessage.error('操作失败，请重试')
        }
      }
    }

    // 审核拒绝（管理员）
    const reject = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确认拒绝 ${row.userName} 的报名申请？`,
          '审核确认',
          { 
            type: 'warning',
            confirmButtonText: '确认拒绝',
            cancelButtonText: '取消'
          }
        )

        await store.dispatch('approveRegistration', { 
          id: row.id, 
          data: { status: 'rejected' } 
        })

        ElMessage.warning(`已拒绝 ${row.userName} 的报名`)
        await store.dispatch('fetchRegistrations')

      } catch (error) {
        if (error !== 'cancel') {
          console.error('审核拒绝失败:', error)
          ElMessage.error('操作失败，请重试')
        }
      }
    }

    // Tab 切换
    const onTabChange = () => {
      store.dispatch('fetchRegistrations')
    }

    // 初始化加载数据
    onMounted(async () => {
      try {
        await Promise.all([
          store.dispatch('fetchRegistrations'),
          store.dispatch('fetchActivities')
        ])
      } catch (error) {
        console.error('加载数据失败:', error)
        ElMessage.error('加载数据失败，请刷新页面重试')
      }
    })

    return {
      activeTab,
      loading,
      currentUser,
      isAdmin,
      pageTitle,
      myRegistrations,
      allRegistrations,
      pendingRegistrations,
      approvedRegistrations,
      rejectedRegistrations,
      getActivityTitle,
      formatTime,
      statusType,
      statusText,
      cancelRegistration,
      approve,
      reject,
      onTabChange
    }
  }
}
</script>

<style scoped>
.register-view {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: 500px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
  color: #303133;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table .el-link) {
  font-weight: 500;
}

:deep(.el-table .el-tag) {
  font-weight: 500;
}

:deep(.el-table .cell) {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

:deep(.el-tabs__item) {
  font-size: 14px;
}

/* 空状态样式 */
:deep(.el-table__empty-text) {
  color: #909399;
  font-size: 14px;
  padding: 30px 0;
}

/* 表格行 hover 效果 */
:deep(.el-table__body tr:hover > td) {
  background-color: #f5f7fa !important;
}

/* 按钮组 */
.action-group {
  display: flex;
  gap: 6px;
}
</style>