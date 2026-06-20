<template>
  <div class="style-detail" v-loading="loading">
    <el-page-header @back="$router.back()" :content="detail?.title" style="margin-bottom:20px" />
    <el-card v-if="detail">
      <h1 class="style-title">{{ detail.title }}</h1>
      <div class="style-meta">
        <el-tag>{{ detail.activityTitle }}</el-tag>
        <span>{{ detail.publishDate }}</span>
        <span>作者：{{ detail.author }}</span>
      </div>
      <el-divider />
      <p class="style-desc">{{ detail.description }}</p>
      <el-row :gutter="12" style="margin-top:20px">
        <el-col :span="12" v-for="(img, idx) in detail.images" :key="idx" style="margin-bottom:12px">
          <el-image :src="img" fit="cover" class="detail-img" :preview-src-list="detail.images" :initial-index="idx" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { styleAPI } from '@/api'

export default {
  name: 'StyleDetail',
  props: { id: { type: [String, Number], required: true } },
  setup(props) {
    const detail = ref(null)
    const loading = ref(false)

    onMounted(async () => {
      loading.value = true
      const res = await styleAPI.getById(Number(props.id))
      detail.value = res.data
      loading.value = false
    })

    return { detail, loading }
  }
}
</script>

<style scoped>
.style-title { font-size: 24px; color: #303133; margin-bottom: 12px; }
.style-meta { display: flex; gap: 16px; align-items: center; font-size: 13px; color: #909399; }
.style-desc { font-size: 15px; color: #606266; line-height: 2; text-indent: 2em; }
.detail-img { width: 100%; height: 280px; border-radius: 8px; cursor: pointer; }
</style>
