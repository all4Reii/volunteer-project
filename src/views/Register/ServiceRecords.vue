<template>
  <div class="service-records">
    <el-card header="服务时长记录">
      <template #header>
        <div class="card-header">
          <span>服务时长记录</span>
          <el-button type="primary" @click="dialogVisible = true" v-if="isAdmin">添加记录</el-button>
        </div>
      </template>
      <el-table :data="displayRecords" border stripe v-loading="loading" empty-text="暂无服务记录">
        <el-table-column prop="id" label="编号" width="60" />
        <el-table-column prop="activityTitle" label="活动名称" min-width="160" />
        <el-table-column prop="userName" label="志愿者" width="100" />
        <el-table-column prop="date" label="服务日期" width="120" />
        <el-table-column prop="hours" label="服务时长(h)" width="110" sortable>
          <template #default="{ row }">
            <el-tag :type="row.hours >= 8 ? 'success' : ''">{{ row.hours }}h</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">{{ row.status === 'completed' ? '已完成' : '进行中' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
      </el-table>
      <div style="margin-top:16px;text-align:right">
        <el-statistic title="累计服务时长" :value="totalHours" suffix="h" />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="添加服务记录" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="选择志愿者">
        <el-select v-model="form.userId" placeholder="选择志愿者" style="width:100%">
          <el-option
            v-for="u in users"
            :key="u.id"
            :label="u.name"
            :value="u.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="选择活动">
        <el-select v-model="form.activityId" placeholder="选择活动" @change="onActivityChange" style="width:100%">
          <el-option
            v-for="a in activities"
            :key="a.id"
            :label="a.title"
            :value="a.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="活动名称">
        <el-input v-model="form.activityTitle" disabled />
      </el-form-item>
        <el-form-item label="服务日期">
          <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="服务时长(h)">
          <el-input-number v-model="form.hours" :min="0" :step="0.5" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addRecord">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'ServiceRecords',
  setup() {
    const store = useStore()
    const dialogVisible = ref(false)
    const activities = computed(() => store.state.activities)
    const users = computed(() => store.state.users) // 或 volunteers
    const form = ref({
      userId: '',
      activityId: 1,
      activityTitle: '',
      date: '',
      hours: 0,
      remark: ''
    })

    onMounted(async () => {
      await store.dispatch('fetchServiceRecords')
      await store.dispatch('fetchActivities')
      await store.dispatch('fetchUsers')
    })

    const loading = computed(() => store.state.loading)
    const records = computed(() => store.state.serviceRecords)
    const isAdmin = computed(() => store.getters.isAdmin)

    const onActivityChange = (id) => {
      const act = activities.value.find(a => a.id == id)
      if (act) {
        form.value.activityTitle = act.title
        form.value.date = act.date
      }
    }

    const displayRecords = computed(() => {
      if (isAdmin.value) {
        // 管理员：显示所有记录
        return records.value
      } else {
        // 志愿者：只显示自己的记录
        const user = store.state.currentUser
        const userId = user.id
        if (!userId) return []
        return records.value.filter(r => r.userId == userId)
      }
    })
    
    const totalHours = computed(() => displayRecords.value.reduce((s, r) => s + r.hours, 0))

    const addRecord = async () => {
      const user = store.state.users?.find(u => u.id == form.value.userId)
      if (!user) {
        ElMessage.warning('请选择志愿者')
        return
      }

      if (!form.value.activityId) {
        ElMessage.warning('请选择活动')
        return
      }

      await store.dispatch('addServiceRecord', {
        userId: user.id,
        userName: user.name,
        activityId: form.value.activityId,
        activityTitle: form.value.activityTitle,
        date: form.value.date,
        hours: form.value.hours,
        remark: form.value.remark,
        status: 'completed'
      })

      ElMessage.success('服务记录已添加')
      dialogVisible.value = false

      form.value = {
        userId: '',
        activityId: '',
        activityTitle: '',
        date: '',
        hours: 0,
        remark: ''
      }
    }

    return {loading, totalHours, dialogVisible, form, addRecord, displayRecords ,isAdmin, activities, users, onActivityChange}
  }
}
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
