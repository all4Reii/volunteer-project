<template>
  <div class="style-view">
    <el-card header="📸 活动风采展示" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="12" v-for="item in styles" :key="item.id" style="margin-bottom:20px">
          <el-card shadow="hover" :body-style="{ padding: '0' }" class="style-card" @click="$router.push(`/style/${item.id}`)">
            <div class="style-img-wrap">
              <el-image :src="item.images[0]" fit="cover" class="style-img" lazy />
              <div class="style-overlay">
                <el-tag type="primary" effect="dark">{{ item.activityTitle }}</el-tag>
              </div>
            </div>
            <div class="style-body">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
              <div class="style-meta">
                <span>{{ item.publishDate }}</span>
                <span>by {{ item.author }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="styles.length === 0" description="暂无风采展示" />
    </el-card>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'StyleView',
  setup() {
    const store = useStore()
    onMounted(() => store.dispatch('fetchStyles'))
    const styles = computed(() => store.state.styles)
    const loading = computed(() => store.state.loading)
    return { styles, loading }
  }
}
</script>

<style scoped>
.style-card { cursor: pointer; border-radius: 10px; overflow: hidden; transition: transform .2s; }
.style-card:hover { transform: translateY(-4px); }
.style-img-wrap { position: relative; height: 220px; overflow: hidden; }
.style-img { width: 100%; height: 100%; }
.style-overlay { position: absolute; top: 10px; left: 10px; }
.style-body { padding: 16px; }
.style-body h3 { font-size: 16px; margin-bottom: 8px; }
.style-body p { font-size: 13px; color: #606266; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.style-meta { display: flex; gap: 16px; margin-top: 10px; font-size: 12px; color: #909399; }
</style>
