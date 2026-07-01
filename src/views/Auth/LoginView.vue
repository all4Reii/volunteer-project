<template>
  <div class="login-page">
    <el-card class="login-card" shadow="always">
      <div class="login-header">
        <el-icon :size="40" color="#409eff"><Finished /></el-icon>
        <h2>{{ isLogin ? '欢迎回来' : '注册账号' }}</h2>
        <!-- <p>{{ isLogin ? '登录你的志愿者账号' : '加入志愿者大家庭' }}</p> -->
        
        <!-- 角色切换标签 -->
        <div v-if="isLogin" style="margin-top: 12px;">
          <el-radio-group v-model="loginRole" size="small" @change="onRoleChange">
            <el-radio-button value="volunteer">志愿者</el-radio-button>
            <el-radio-button value="admin">管理员</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-width="0" 
        size="large"
        @keyup.enter="handleSubmit"
      >
        <el-form-item prop="phone">
          <el-input 
            v-model="form.phone" 
            :placeholder="loginRole === 'admin' ? '请输入管理员账号' : '请输入手机号'" 
            :prefix-icon="loginRole === 'admin' ? User : Phone"
            clearable
          />
        </el-form-item>

        <el-form-item v-if="!isLogin" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" :prefix-icon="User" clearable />
        </el-form-item>

        <el-form-item v-if="!isLogin" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱（选填）" :prefix-icon="Message" clearable />
        </el-form-item>

        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            :prefix-icon="Lock" 
            show-password
          />
        </el-form-item>

        <el-form-item v-if="!isLogin" prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="确认密码" 
            :prefix-icon="Lock" 
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" style="width:100%" :loading="loading" @click="handleSubmit">
            {{ isLogin ? '登 录' : '注 册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span>{{ isLogin ? '还没有账号？' : '已有账号？' }}</span>
        <el-link type="primary" @click="toggleMode">
          {{ isLogin ? '立即注册' : '去登录' }}
        </el-link>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
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
    const loginRole = ref('volunteer') // 'volunteer' | 'admin'
    const showHint = ref(true)
    const formRef = ref(null)

    // 表单数据
    const form = reactive({
      phone: '',
      password: '',
      name: '',
      email: '',
      confirmPassword: ''
    })

    // 切换角色时清空表单
    const onRoleChange = () => {
      form.phone = ''
      form.password = ''
      formRef.value?.clearValidate()
    }

    // 验证规则
    const rules = computed(() => ({
      phone: [
        { 
          required: true, 
          message: loginRole.value === 'admin' ? '请输入管理员账号' : '请输入手机号', 
          trigger: 'blur' 
        }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 3, message: '密码至少3位', trigger: 'blur' }
      ],
      name: !isLogin.value ? [
        { required: true, message: '请输入姓名', trigger: 'blur' }
      ] : [],
      email: !isLogin.value ? [
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ] : [],
      confirmPassword: !isLogin.value ? [
        {
          validator: (rule, value, callback) => {
            if (value !== form.password) {
              callback(new Error('两次密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ] : []
    }))

    // 切换登录/注册模式
    const toggleMode = () => {
      isLogin.value = !isLogin.value
      loginRole.value = 'volunteer'
      showHint.value = true
      // 清空表单
      Object.keys(form).forEach(key => form[key] = '')
      formRef.value?.clearValidate()
    }

    // 提交表单
    const handleSubmit = async () => {
      try {
        await formRef.value?.validate()
      } catch {
        return
      }

      loading.value = true

      try {
        if (isLogin.value) {
          // ========== 登录逻辑 ==========
          let user = null

          if (loginRole.value === 'admin') {
            // 管理员登录 - 从 admins 数组验证
            const res = await store.dispatch('adminLogin', {
              phone: form.phone,
              password: form.password
            })
            user = res
            ElMessage.success('管理员登录成功！')
          } else {
            // 普通用户登录
            const res = await store.dispatch('login', { 
              phone: form.phone, 
              password: form.password 
            })
            user = res || store.state.currentUser
            
            if (!user) {
              throw new Error('登录失败，请检查账号或密码')
            }
            ElMessage.success('登录成功！')
          }

          // 跳转 登录成功后，如果用户是从某个页面被拦截来的，就回到原页面；否则就去首页
          const redirect = route.query.redirect || '/'
          router.push(redirect)
          
        } else {
          // ========== 注册逻辑==========
          await store.dispatch('register', {
            name: form.name,
            phone: form.phone,
            password: form.password,
            email: form.email || '',
            avatar: '',
            joinDate: new Date().toISOString().slice(0, 10)
          })

          ElMessage.success('注册成功！')
          router.push('/')
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message || '操作失败'
        ElMessage.error(message)
      } finally {
        loading.value = false
      }
    }

    return {
      isLogin,
      form,
      rules,
      formRef,
      loading,
      loginRole,
      showHint,
      onRoleChange,
      handleSubmit,
      toggleMode,
      Phone,
      User,
      Lock,
      Message,
      Finished
    }
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-card {
  width: 420px;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-header h2 {
  font-size: 22px;
  color: #303133;
  margin: 10px 0 4px;
}

.login-header p {
  font-size: 13px;
  color: #909399;
}

.login-footer {
  text-align: center;
  font-size: 13px;
  color: #909399;
  margin-top: 8px;
}

.login-footer .el-link {
  font-size: 13px;
  margin-left: 4px;
}

:deep(.el-radio-button__inner) {
  padding: 6px 16px;
  font-size: 13px;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 4px 0 0 4px;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 4px 4px 0;
}
</style>