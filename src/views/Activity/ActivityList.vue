<template>
  <div class="activity-list">
    <el-card header="筛选条件" shadow="never" class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :span="5">
          <el-select v-model="filterRegion" placeholder="选择地区" clearable @change="doFilter">
            <el-option v-for="r in regions" :key="r" :label="r" :value="r" />
          </el-select>
        </el-col>
        <el-col :span="7">
          <el-date-picker v-model="filterDateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" @change="doFilter" style="width:100%" />
        </el-col>
        <el-col :span="5">
          <el-select v-model="filterCategory" placeholder="选择类别" clearable @change="doFilter">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="resetFilter">重置筛选</el-button>
        </el-col>
        <el-col :span="3" style="text-align:right">
          <span v-if="regionParam" class="region-hint">📍 {{ regionParam }}</span>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20" v-loading="loading">
      <el-col :span="8" v-for="item in filteredActivities" :key="item.id" style="margin-bottom:20px">
        <el-card shadow="hover" :body-style="{ padding: '0' }" class="activity-card" @click="$router.push(`/activity/${item.id}`)">
          <div class="card-img-wrap">
            <img :src="item.image" class="card-img" />
            <el-tag class="card-badge" :type="item.status === 'recruiting' ? 'success' : 'warning'" effect="dark">{{ item.status === 'recruiting' ? '招募中' : '已满额' }}</el-tag>
          </div>
          <div class="card-body">
            <h3>{{ item.title }}</h3>
            <div class="card-meta">
              <span><el-icon><Location /></el-icon> {{ item.region }}</span>
              <span><el-icon><Calendar /></el-icon> {{ item.date }}</span>
            </div>
            <div class="card-meta">
              <span><el-icon><Clock /></el-icon> {{ item.time }}</span>
              <span><el-icon><User /></el-icon> {{ item.currentVolunteers }}/{{ item.maxVolunteers }}人</span>
            </div>
            <el-progress :percentage="Math.round(item.currentVolunteers / item.maxVolunteers * 100)" :stroke-width="6" style="margin-top:8px" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-empty v-if="!loading && filteredActivities.length === 0" description="暂无活动" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ActivityList',
  props: { region: { type: String, default: '' } },
  setup(props) {
    const store = useStore()
    const filterRegion = ref('')
    const filterDateRange = ref(null)
    const filterCategory = ref('')
    const regionParam = ref(props.region || '')

    onMounted(async () => {
      if (props.region) {
        filterRegion.value = props.region
        await store.dispatch('fetchActivities', { region: props.region })
      } else {
        await store.dispatch('fetchActivities')
      }
    })

    const loading = computed(() => store.state.loading)
    const activities = computed(() => store.state.activities)
    const regions = computed(() => [...new Set(activities.value.map(a => a.region))])
    const categories = computed(() => [...new Set(activities.value.map(a => a.category))])

    const filteredActivities = computed(() => {
      let list = activities.value
      if (filterRegion.value) list = list.filter(a => a.region === filterRegion.value)
      if (filterCategory.value) list = list.filter(a => a.category === filterCategory.value)
      if (filterDateRange.value && filterDateRange.value.length === 2) {
        const [start, end] = filterDateRange.value
        list = list.filter(a => a.date >= start && a.date <= end)
      }
      return list
    })

    const doFilter = () => { /* computed reacts */ }
    const resetFilter = () => {
      filterRegion.value = ''
      filterDateRange.value = null
      filterCategory.value = ''
      store.dispatch('fetchActivities')
    }

    return { filterRegion, filterDateRange, filterCategory, filteredActivities, regions, categories, loading, doFilter, resetFilter, regionParam }
  }
}
</script>

<style scoped>
.filter-card { margin-bottom: 20px; }
.activity-card { cursor: pointer; border-radius: 10px; overflow: hidden; transition: transform .2s, box-shadow .2s; }
.activity-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,.1); }
.card-img-wrap { position: relative; }
.card-img { width: 100%; height: 180px; object-fit: cover; }
.card-badge { position: absolute; top: 10px; right: 10px; }
.card-body { padding: 16px; }
.card-body h3 { font-size: 16px; margin-bottom: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-meta { display: flex; gap: 16px; margin-bottom: 4px; font-size: 13px; color: #606266; }
.card-meta span { display: flex; align-items: center; gap: 4px; }
.region-hint { color: #409eff; font-weight: bold; font-size: 14px; }
</style>
