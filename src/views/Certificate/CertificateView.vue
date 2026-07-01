<template>
  <div class="certificate-view">
    <el-card header="我的证书">
      <el-row :gutter="20">
        <el-col :span="8" v-for="cert in myCertificates" :key="cert.id" style="margin-bottom:20px">
          <el-card shadow="hover" class="cert-card" @click="$router.push(`/certificate/${cert.id}`)">
            <div class="cert-preview">
              <el-icon :size="48" color="#409eff"><Medal /></el-icon>
              <h3>志愿者证书</h3>
              <p class="cert-number">{{ cert.certNumber }}</p>
              <el-divider />
              <p>活动：{{ cert.activityTitle }}</p>
              <p>服务时长：<strong>{{ cert.totalHours }}小时</strong></p>
              <p>颁发日期：{{ cert.issueDate }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="myCertificates.length === 0" description="暂无证书，请先生成" />
    </el-card>

    <el-card header="🔧 生成证书" style="margin-top:20px">
      <el-alert title="服务时长概览" type="success" :closable="false" show-icon style="margin-bottom:16px">
        <p>累计服务记录：{{ myRecords.length }} 条 | 累计服务时长：<strong>{{ totalMyHours }} 小时</strong></p>
      </el-alert>

      <el-form :model="certForm" label-width="120px" inline>
        <el-form-item label="关联活动">
          <el-select v-model="certForm.activityId" placeholder="选择已完成的活动" @change="onActivityChange" style="width:260px">
            <el-option v-for="a in myActivities" :key="a.id" :label="`${a.activityTitle} (${a.hours}h)`" :value="a.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务时长(h)">
          <el-input-number v-model="certForm.totalHours" :min="0" :step="0.5" style="width:160px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="generateCert">一键生成证书</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'CertificateView',
  setup() {
    const store = useStore() 
    const certForm = ref({ activityId: null, totalHours: 0, activityTitle: '' })
    const currentUserId = computed(() => store.state.currentUser?.id)

    onMounted(async () => {
      if (currentUserId.value) {
        await store.dispatch('fetchCertificates', { userId: currentUserId.value })
        await store.dispatch('fetchServiceRecords', { userId: currentUserId.value })
      }
      await store.dispatch('fetchActivities')
    })

    const myCertificates = computed(() =>
      store.state.certificates.filter(c => String(c.userId) === String(currentUserId.value))
    )
    const myRecords = computed(() =>
      store.state.serviceRecords.filter(r => String(r.userId) === String(currentUserId.value) && r.status === 'completed')
    )

    const totalMyHours = computed(() =>
      myRecords.value.reduce((s, r) => s + Number(r.hours || 0), 0)
    )

    const myActivities = computed(() => {
      const map = {}
      myRecords.value.forEach(r => {
        if (!map[r.activityId]) {
          map[r.activityId] = { id: r.activityId, activityTitle: r.activityTitle, hours: 0 }
        }
        map[r.activityId].hours += Number(r.hours || 0)
      })
      return Object.values(map)
    })

    const onActivityChange = (id) => {
      const act = myActivities.value.find(a => String(a.id) === String(id))
      if (act) {
        certForm.value.activityTitle = act.activityTitle
        certForm.value.totalHours = act.hours
      }
    }

    const generateCert = async () => {
      if (!certForm.value.activityId) {
        ElMessage.warning('请选择活动')
        return
      }

      if (certForm.value.totalHours <= 0) {
        ElMessage.warning('服务时长必须大于0')
        return
      }

      // 关键：检查是否已存在证书
      const exists = myCertificates.value.some(
        c =>
          String(c.userId) === String(currentUserId.value) &&
          String(c.activityId) === String(certForm.value.activityId)
      )

      if (exists) {
        ElMessage.warning('该活动证书已生成，请勿重复生成')
        return
      }

      await store.dispatch('generateCertificate', {
        userId: currentUserId.value,
        userName: store.state.currentUser?.name,
        activityId: certForm.value.activityId,
        activityTitle: certForm.value.activityTitle,
        totalHours: certForm.value.totalHours,
        issueDate: new Date().toISOString().slice(0, 10),
        certNumber:
          'CERT-' +
          new Date().getFullYear() +
          '-' +
          String(Math.floor(Math.random() * 9000 + 1000))
      })

      ElMessage.success('证书生成成功！')

      certForm.value = {
        activityId: null,
        totalHours: 0,
        activityTitle: ''
      }
    }

    return { myCertificates, myRecords, totalMyHours, myActivities, certForm, onActivityChange, generateCert }
  }
}
</script>

<style scoped>
.cert-card { cursor: pointer; transition: transform .2s; border-radius: 12px; text-align: center; }
.cert-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,.12); }
.cert-preview { padding: 16px 0; }
.cert-preview h3 { margin: 8px 0 4px; font-size: 16px; color: #303133; }
.cert-number { font-size: 13px; color: #909399; font-family: monospace; }
.cert-preview p { font-size: 13px; color: #606266; margin: 4px 0; }
</style>
