<template>
  <div class="cert-detail" v-loading="loading">
    <el-page-header @back="$router.back()" content="证书详情" style="margin-bottom:20px" />
    <el-card v-if="cert">
      <div class="certificate">
        <div class="cert-border">
          <div class="cert-inner">
            <el-icon :size="60" color="#409eff"><Medal /></el-icon>
            <h1>志愿者服务证书</h1>
            <p class="cert-no">编号：{{ cert.certNumber }}</p>
            <el-divider />
            <p class="cert-text">兹证明</p>
            <h2 class="cert-name">{{ cert.userName }}</h2>
            <p class="cert-text">在<strong>「{{ cert.activityTitle }}」</strong>志愿服务活动中，</p>
            <p class="cert-text">累计服务时长为 <strong style="font-size:24px;color:#409eff">{{ cert.totalHours }} 小时</strong>，</p>
            <p class="cert-text">特发此证，以资鼓励。</p>
            <el-divider />
            <p class="cert-date">颁发日期：{{ cert.issueDate }}</p>
            <p class="cert-org">志愿者服务平台 敬颁</p>
            <el-button type="primary" style="margin-top:16px" @click="printCert">打印证书</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { certificateAPI } from '@/api'

export default {
  name: 'CertificateDetail',
  props: { id: { type: [String, Number], required: true } },
  setup(props) {
    const cert = ref(null)
    const loading = ref(false)

    onMounted(async () => {
      loading.value = true
      const res = await certificateAPI.getById(props.id)
      cert.value = res.data
      loading.value = false
    })

    const printCert = () => window.print()

    return { cert, loading, printCert }
  }
}
</script>

<style scoped>
.certificate { display: flex; justify-content: center; padding: 20px; }
.cert-border { border: 4px double #409eff; border-radius: 12px; max-width: 700px; width: 100%; padding: 8px; }
.cert-inner { border: 2px solid #d9ecff; border-radius: 8px; padding: 40px 30px; text-align: center; }
.cert-inner h1 { font-size: 28px; color: #303133; margin: 12px 0 8px; }
.cert-no { font-size: 13px; color: #909399; font-family: monospace; }
.cert-text { font-size: 16px; color: #606266; margin: 8px 0; line-height: 2; }
.cert-name { font-size: 26px; color: #409eff; margin: 12px 0; font-weight: bold; }
.cert-date { font-size: 14px; color: #909399; margin-top: 12px; }
.cert-org { font-size: 16px; color: #303133; font-weight: bold; margin-top: 24px; }
@media print {
  .el-page-header, .el-button { display: none !important; }
  .cert-border { border-color: #000 !important; }
  .cert-inner { border-color: #000 !important; }
}
</style>
