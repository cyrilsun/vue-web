<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="search.name" placeholder="名称" style="width: 140px;" clearable class="filter-item" @clear="search.name=null" @keyup.enter.native="handleFilter" />
      <el-input v-model="search.website" placeholder="网址" style="width: 140px;" clearable class="filter-item" @clear="search.website=null" @keyup.enter.native="handleFilter" />
      <el-select v-model="search.groupId" placeholder="分组" style="width: 140px;" clearable filterable class="filter-item" @clear="search.groupId=null" @keyup.enter.native="handleFilter">
        <el-option
          v-for="item in groupList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
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
      <el-table-column label="名称" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="网址" width="200px" align="center">
        <template slot-scope="{row}">
          <span><a :href="row.website.indexOf('http')===0?row.website:'https://'+row.website" target="_blank" style="color: blue">
            {{ row.website }}</a></span>
        </template>
      </el-table-column>
      <el-table-column label="本地秘钥" align="center" width="100">
        <template slot-scope="{row}">
          <span>
            {{ row.localStorage | localStorageFilter }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="分组" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ getGroupName(row.groupId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleSelectCode(row)">
            查看
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdateCode(row)">
            重置
          </el-button>
          <el-button v-if="row.status!=='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" center>
      <el-form ref="dataForm" :rules="rulesList" :model="temp" label-position="left" label-width="80px" style="margin-left:30px;margin-right:30px;">
        <el-form-item v-if="dialogStatus !== 'updateCode'" label="名称" prop="name">
          <el-input v-model="temp.name" clearable :disabled="dialogStatus==='selectCode'" />
        </el-form-item>
        <el-form-item v-if="dialogStatus !== 'updateCode'" label="网址" prop="website">
          <el-input v-model="temp.website" clearable :disabled="dialogStatus==='selectCode'">
            <el-button v-if="dialogStatus === 'selectCode'" slot="append" size="mini" @click="handleOpen(temp.website)">打开</el-button>
            <el-button v-if="dialogStatus === 'selectCode'" slot="append" size="mini" @click="handleCopyText(temp.website)">复制</el-button>
          </el-input>
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create' || dialogStatus === 'updateCode'" label="用户名" prop="username">
          <el-input v-model="temp.username" clearable />
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'selectCode'" label="用户名" prop="username">
          <el-input v-model="temp.username" maxlength="64" disabled>
            <el-button v-if="dialogStatus === 'selectCode'" slot="append" size="mini" @click="handleCopyText(temp.username)">复制</el-button>
          </el-input>
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create' || dialogStatus === 'updateCode'" label="密码" prop="code">
          <el-input v-model="temp.code" maxlength="32" show-password />
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'selectCode'" label="密码" prop="code">
          <el-input v-model="temp.code" maxlength="32" show-password>
            <el-button v-if="dialogStatus === 'selectCode'" slot="append" size="mini" @click="handleCopyText(temp.code)">复制</el-button>
          </el-input>
        </el-form-item>
        <el-form-item v-if="dialogStatus !== 'updateCode'" label="提示" prop="tip">
          <el-input v-model="temp.tip" clearable :disabled="dialogStatus==='selectCode'" />
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create' || dialogStatus === 'updateCode'" label="本地秘钥">
          <el-select v-model="temp.localStorage" class="filter-item" placeholder="请选择" @change="selectChanged">
            <el-option v-for="item in localStorageOptions" :key="item.key" :label="item.name" :value="item.key" />
          </el-select>
          <el-tooltip effect="light" content="秘钥保存方式:'否':系统保存秘钥;'是':自己保存秘钥" placement="right-start">
            <i class="el-icon-question" />
          </el-tooltip>
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create' || dialogStatus === 'updateCode' || temp.custom===1" label="秘钥" prop="salt">
          <el-input v-model="temp.salt" :placeholder="dialogStatus==='selectCode'?'输入秘钥查看密码':''" clearable />
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create' || dialogStatus === 'update'" label="分组" prop="groupId">
          <el-select v-model="temp.groupId" placeholder="请选择分组" clearable>
            <el-option
              v-for="item in groupList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create' || dialogStatus === 'update'" label="备注" prop="remark">
          <el-input v-model="temp.remark" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button v-if="dialogStatus==='create' || dialogStatus==='update'" type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
        <el-button v-if="dialogStatus==='selectCode'" :disabled="temp.custom===0" type="primary" @click="showCode(temp)">
          显示密码
        </el-button>
        <el-button v-if="dialogStatus==='updateCode'" type="primary" @click="updateCode()">
          重置密码
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, createPassword, updatePassword, deletePassword, selectDetail, selectCode, updateCode } from '@/api/password'
import Pagination from '@/components/Pagination'
import { listAllGroupListData } from '@/api/password-group' // secondary package based on el-pagination

const localStorageOptions = [
  { key: 0, name: '否' },
  { key: 1, name: '是' }
]
export default {
  name: 'ComplexTable',
  components: { Pagination },
  filters: {
    localStorageFilter(localStorage) {
      const localStorageMap = {
        0: '否',
        1: '是'
      }
      return localStorageMap[localStorage]
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
      localStorageOptions,
      showReviewer: false,
      temp: {
        id: undefined,
        name: null,
        website: null,
        username: null,
        code: null,
        tip: null,
        localStorage: null,
        salt: null,
        custom: null,
        groupId: null,
        remark: null,
        createTime: undefined
      },
      dialogFormVisible: false,
      groupList: [],
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增',
        updateCode: '重置密码',
        selectCode: '查看密码'
      },
      rules: {
        name: [{ required: true, message: '请输入网址名称', trigger: 'change' }],
        website: [{ required: true, message: '请输入网址', trigger: 'blur' }]
      },
      createRules: {
        name: [{ required: true, message: '请输入网址名称', trigger: 'change' }],
        website: [{ required: true, message: '请输入网址', trigger: 'blur' }],
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        code: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        salt: [{ required: false, message: '请输入秘钥', trigger: 'blur' }]
      },
      selectCodeRules: {
        salt: [{ required: true, message: '请输入秘钥', trigger: 'blur' }]
      },
      updateCodeRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        code: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        salt: [{ required: false, message: '请输入秘钥', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  computed: {
    rulesList: function() {
      if (this.dialogStatus === 'create') {
        return this.createRules
      } else if (this.dialogStatus === 'update') {
        return this.rules
      } else if (this.dialogStatus === 'selectCode' && this.temp.localStorage === 1) {
        return this.selectCodeRules
      } else if (this.dialogStatus === 'updateCode') {
        return this.updateCodeRules
      }
      return null
    }
  },
  created() {
    this.getList()
    this.selectGroups()
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
        name: null,
        website: null,
        username: null,
        code: null,
        tip: null,
        localStorage: 0,
        salt: null,
        custom: null,
        groupId: null,
        remark: null
      }
    },
    getGroupName(groupId) {
      let groupName = ''
      this.groupList.map(group => {
        if (groupId === group.id) {
          groupName = group.name
        }
      })
      return groupName
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      if (this.temp.localStorage === 0) {
        this.rulesList.salt = [{ required: false, message: '请输入秘钥', trigger: 'blur' }]
      }
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // console.log('@', this.temp)
          createPassword(this.temp).then(() => {
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
    handleSelectCode(row) {
      selectCode(row).then(response => {
        this.temp = response.data
        this.temp.localStorage = row.localStorage
      })
      this.dialogStatus = 'selectCode'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdateCode(row) {
      this.resetTemp()
      this.temp.id = row.id
      this.temp.username = row.username
      this.temp.localStorage = row.localStorage
      this.dialogStatus = 'updateCode'
      this.dialogFormVisible = true
      if (this.temp.localStorage === 0) {
        this.rulesList.salt = [{ required: false, message: '请输入秘钥', trigger: 'blur' }]
      }
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateCode() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateCode(tempData).then(() => {
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
    showCode(row) {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          selectCode(row).then(response => {
            this.temp = response.data
            this.temp.name = row.name
            this.temp.website = row.website
            this.temp.localStorage = row.localStorage
            this.temp.salt = row.salt
          })
        }
      })
    },
    handleUpdate(row) {
      selectDetail(row.id).then(response => {
        this.temp = response.data
      })
      // this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      // this.selectGroups()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updatePassword(tempData).then(() => {
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
        deletePassword(row.id).then(() => {
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
    selectGroups() {
      listAllGroupListData().then(response => {
        this.groupList = response.data
      })
    },
    refresh() {
      // this.selectionArr = []
      // this.deleteArr = []
      // f && (this.listQuery.page = 1)
      this.getList()
    },
    handleOpen(url) {
      if (url.indexOf('http') === -1) {
        url = 'https://' + url
      }
      window.open(url, '_blank')
    },
    selectChanged() {
      console.log('salt check', this.temp.localStorage)
      if (this.temp.localStorage === 1) {
        this.rulesList.salt = [{ required: true, message: '请输入秘钥', trigger: 'blur' }]
      } else {
        this.rulesList.salt = [{ required: false, message: '请输入秘钥', trigger: 'blur' }]
      }
    },
    // 复制
    handleCopyText(content) {
      // 创建一个 Input标签
      if (content === '' || content === null) {
        this.$message.info('内容为空')
        return
      }
      const cInput = document.createElement('input')
      cInput.value = content
      document.body.appendChild(cInput)
      cInput.select() // 选取文本域内容;
      // 执行浏览器复制命令
      // 复制命令会将当前选中的内容复制到剪切板中（这里就是创建的input标签）
      // Input要在正常的编辑状态下原生复制方法才会生效
      document.execCommand('Copy')
      this.$message.success('复制成功')
      // 复制成功后再将构造的标签 移除
      cInput.remove()
    }
  }
}
</script>
