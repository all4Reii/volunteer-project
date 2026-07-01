<template>
  <div class="activity-detail" v-loading="loading">
    <el-page-header @back="$router.back()" :content="activity?.title" style="margin-bottom:20px" />
    <el-row :gutter="24" v-if="activity">
      <el-col :span="14">
        <el-card>
          <img :src="activity.image" class="detail-img" />
          <el-descriptions :column="2" border style="margin-top:20px">
            <el-descriptions-item label="活动名称">{{ activity.title }}</el-descriptions-item>
            <el-descriptions-item label="活动类别">
              <el-tag>{{ activity.category }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="地区">{{ activity.region }}</el-descriptions-item>
            <el-descriptions-item label="日期">{{ activity.date }}</el-descriptions-item>
            <el-descriptions-item label="时间">{{ activity.time }}</el-descriptions-item>
            <el-descriptions-item label="地点">{{ activity.location }}</el-descriptions-item>
            <el-descriptions-item label="组织者">{{ activity.organizer }}</el-descriptions-item>
            <el-descriptions-item label="联系方式">{{ activity.contactPhone }}</el-descriptions-item>
            <el-descriptions-item label="招募进度">
              <el-progress :percentage="Math.round(activity.currentVolunteers / activity.maxVolunteers * 100)" :stroke-width="10" />
              {{ activity.currentVolunteers }}/{{ activity.maxVolunteers }}人
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="activity.status === 'recruiting' ? 'success' : 'warning'">{{ activity.status === 'recruiting' ? '招募中' : '已满额' }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <el-divider />
          <h4>活动描述</h4>
          <p style="font-size:14px;color:#606266;line-height:1.8;margin-top:8px">{{ activity.description }}</p>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card v-if="!isAdmin" header="报名参加">
          <el-form :model="regForm" label-width="80px">
            <el-form-item label="姓名">
              <el-input v-model="regForm.userName" disabled />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="regForm.phone" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="regForm.remark" type="textarea" :rows="3" placeholder="申请备注（选填）" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" :disabled="activity.status !== 'recruiting'" @click="submitRegister" style="width:100%">
                {{ activity.status === 'recruiting' ? '立即报名' : '已满额' }}
              </el-button>
            </el-form-item>
          </el-form>
          <el-alert title="提示" type="info" :closable="false" style="margin-top:12px" show-icon>
            报名后请等待管理员审核，审核通过后将记录服务时长。
          </el-alert>
        </el-card>
        <el-card v-else>
          <el-empty description="管理员不可报名参与活动" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

export default {
  name: 'ActivityDetail',
  props: { id: { type: [String, Number], required: true } },
  setup(props) {
    const store = useStore()
    const user = computed(() => store.state.currentUser || {})
    const regForm = ref({
      userId: user.value.id,
      userName: user.value.name,
      phone: user.value.phone,
      remark: ''
    })

    onMounted(() => store.dispatch('fetchActivityById', Number(props.id)))
    const isAdmin = computed(() => store.getters.isAdmin)
    const activity = computed(() => store.state.currentActivity)
    const loading = computed(() => store.state.loading)
    const router = useRouter()
    const currentUser = computed(() => store.state.currentUser)
    const registrations = computed(() => store.state.registrations)


    const submitRegister = async () => {
      if (hasRegistered.value) {
        ElMessage.warning('您已报名该活动，请勿重复报名')
        return
      }
      if (!currentUser.value) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }
      const data = {
        activityId: activity.value.id,
        userId: regForm.value.userId,
        userName: regForm.value.userName,
        phone: regForm.value.phone,
        status: 'pending',
        registerTime: new Date().toISOString()
      }
      await store.dispatch('submitRegistration', data)
      //console.log(data.id)
      ElMessage.success('报名成功，请等待审核！')
    }

    const hasRegistered = computed(() => {
      if (!currentUser.value || !activity.value) return false

      return registrations.value.some(r =>
        String(r.userId) === String(currentUser.value.id) &&
        String(r.activityId) === String(activity.value.id) &&
        r.status !== 'cancelled'
      )
    })

    return { activity, loading, regForm, submitRegister, hasRegistered ,isAdmin}
  }
}
</script>

<style scoped>
.detail-img { width: 100%; height: 320px; object-fit: cover; border-radius: 8px; }
</style>
