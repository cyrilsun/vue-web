<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="search.name" placeholder="姓名" style="width: 140px;" clearable @clear="search.name=null" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="search.phone" placeholder="手机号" style="width: 140px;" clearable @clear="search.phone=null" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="search.username" placeholder="用户名" style="width: 140px;" clearable @clear="search.username=null" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <!-- <el-table-column label="ID" prop="id" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>-->
      <el-table-column label="用户名" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" align="center" width="100">
        <template slot-scope="{row}">
          <span >
            {{ row.gender | genderFilter }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
          <el-button size="mini" type="danger" @click="handleResetPassword(row)">
            重置密码
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" center>
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="temp.username" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="temp.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="temp.gender" class="filter-item" placeholder="请选择">
            <el-option v-for="item in genderOptions" :key="item.key" :label="item.name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="temp.roleIds" multiple placeholder="请选择角色">
            <el-option
              v-for="item in allRoleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, createUser, updateUser, deleteUser, resetPassword } from '@/api/user-manage'
import { listAllRoleListData } from '@/api/role'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const genderOptions = [
  { key: 1, name: '男' },
  { key: 2, name: '女' }
]
export default {
  name: 'ComplexTable',
  components: { Pagination },
  filters: {
    genderFilter(gender) {
      const genderMap = {
        1: '男',
        2: '女',
        3: '保密'
      }
      return genderMap[gender]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      },
      search: { name: null, phone: null, username: null },
      genderOptions,
      showReviewer: false,
      temp: {
        id: undefined,
        username: null,
        name: null,
        phone: null,
        email: null,
        gender: null,
        roleIds: null,
        createTime: undefined
      },
      dialogFormVisible: false,
      allRoleList: [],
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'change' }],
        name: [{ required: true, message: '请输入姓名', trigger: 'change' }],
        phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
        roleIds: [{ required: true, message: '请选择角色', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery, this.search).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        username: null,
        name: null,
        phone: null,
        email: null,
        gender: null
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.selectRoles()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // console.log('@', this.temp)
          createUser(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '创建成功',
              message: '操作成功',
              type: 'success',
              duration: 2000
            })
            this.refresh()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.selectRoles()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateUser(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '更新成功',
              message: '操作成功',
              type: 'success',
              duration: 2000
            })
            this.refresh()
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除吗?', '操作提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(row.id).then(response => {
          this.refresh()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleResetPassword(row) {
      this.$confirm('确认重置密码吗?', '操作提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetPassword(row.id)
        this.$message({
          type: 'success',
          message: '重置密码成功!'
        })
        this.refresh()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消重置密码'
        })
      })
    },
    selectRoles() {
      listAllRoleListData().then(response => {
        this.allRoleList = response.data
      })
    },
    refresh() {
      // this.selectionArr = []
      // this.deleteArr = []
      // f && (this.listQuery.page = 1)
      this.getList()
    }
  }
}
</script>
