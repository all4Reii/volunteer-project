<template>
  <div class="login-page">
    <el-card class="login-card" shadow="always">
      <div class="login-header">
        <el-icon :size="40" color="#409eff"><Finished /></el-icon>
        <h2>{{ isLogin ? '欢迎回来' : '注册账号' }}</h2>
        <p>{{ isLogin ? '登录你的志愿者账号' : '加入志愿者大家庭' }}</p>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="0" size="large">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" :prefix-icon="Phone" />
        </el-form-item>

        <el-form-item v-if="!isLogin" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" :prefix-icon="User" />
        </el-form-item>

        <el-form-item v-if="!isLogin" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱（选填）" :prefix-icon="Message" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" show-password />
        </el-form-item>

        <el-form-item v-if="!isLogin" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" :prefix-icon="Lock" show-password />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" style="width:100%" :loading="loading" @click="handleSubmit">
            {{ isLogin ? '登 录' : '注 册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span>{{ isLogin ? '还没有账号？' : '已有账号？' }}</span>
        <el-link type="primary" @click="isLogin = !isLogin">
          {{ isLogin ? '立即注册' : '去登录' }}
        </el-link>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Phone, User, Lock, Message, Finished } from '@element-plus/icons-vue'

export default {
  name: 'LoginView',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const isLogin = ref(true)
    const loading = ref(false)
    const formRef = ref(null)

    const form = reactive({ phone: '', password: '', name: '', email: '', confirmPassword: '' })

    const rules = {
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码至少6位', trigger: 'blur' }
      ],
      name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
      confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== form.password) callback(new Error('两次密码不一致'))
            else callback()
          },
          trigger: 'blur'
        }
      ]
    }

    const handleSubmit = async () => {
      const valid = await formRef.value.validate().catch(() => false)
      if (!valid) return

      loading.value = true
      try {
        if (isLogin.value) {
          await store.dispatch('login', { phone: form.phone, password: form.password })
          ElMessage.success('登录成功！')
          const redirect = route.query.redirect || '/'
          router.push(redirect)
        } else {
          await store.dispatch('register', {
            name: form.name,
            phone: form.phone,
            password: form.password,
            email: form.email,
            avatar: '',
            joinDate: new Date().toISOString().slice(0, 10)
          })
          ElMessage.success('注册成功！')
          router.push('/')
        }
      } catch (e) {
        ElMessage.error(e.message || '操作失败')
      } finally {
        loading.value = false
      }
    }

    return { isLogin, form, rules, formRef, loading, handleSubmit, Phone, User, Lock, Message, Finished }
  }
}
</script>

<style scoped>
.login-page { display: flex; justify-content: center; align-items: center; min-height: 70vh; }
.login-card { width: 420px; border-radius: 12px; }
.login-header { text-align: center; margin-bottom: 28px; }
.login-header h2 { font-size: 22px; color: #303133; margin: 10px 0 4px; }
.login-header p { font-size: 13px; color: #909399; }
.login-footer { text-align: center; font-size: 13px; color: #909399; margin-top: 8px; }
</style>
