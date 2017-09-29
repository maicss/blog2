const moment = require('moment')
const marked = require('maic-marked')
const {getMomentsList, saveMoments, getMomentsSummary, deleteMoments, updateMoments} = require('../database')
const fs = require('fs')
const unlink = require('util')
const Router = require('koa-router')


const router = Router()

/**
 * 这里不想写HTTP Method
 * */

router.get