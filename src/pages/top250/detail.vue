<template>
	<view class="new-page">
		<video @waiting="videoWaiting"
			   id="myVideo"
			   class="video"
			   :show-casting-button="true"
			   @error="videoError"
			   :title="movieName"
			   :enable-play-gesture="true"
			   picture-in-picture-mode="pop"
			   autoplay
			   controls
			   :src="currentUrl">
		</video>
		<view class="source-box">
			<view>播放来源</view>
			<view>
				<radio-group class="radio-box" @change="changeRadio">
					<label class="radio" v-for="(item, index) in urlList" :key="index">
						<radio color="#5ba757" :value="item.value" :checked="item.value === currentUrl"/>{{item.name}}
					</label>
				</radio-group>
			</view>
		</view>
		<view class="des-box">
			<view>剧情简介</view>
			<view class="content">
				{{movieData && (movieData.decs || '')}}
			</view>
		</view>
	</view>
</template>

<script>
	import * as api from '../../api/api'
	import * as util from '../../common/util'
	export default {
		data() {
			return {
				videoContext: '',
				movieId: '',
				movieName: '',
				movieData: {},
				urlList: [],
				currentUrl: ''
			}
		},
		computed: {
		},
		onReachBottom() {
			// console.log('滑动到页面底部')
			// if (!this.nextPageUrl) {
			// 	this.loadMoreText = '已经到底啦'
			// 	return;
			// }
			// this.getData()
		},

		methods: {
			// 视频缓冲中
			videoWaiting () {
				console.log('视频缓冲中')
			},
			videoError () {
				this.videoContext.stop()
				uni.showToast({
					title: `抱歉，视频加载失败，尝试其它播放源！`,
					icon: 'none',
				})
			},
			async changeRadio (e) {
				this.currentUrl = e.detail.value
				await this.$nextTick()
				this.videoContext.play()
			},
			async getData() {
				uni.showLoading({
					title: '视频加载中，请耐心等待'
				})
				let res = await wx.cloud.callFunction({
					name: 'getSearchVideo',
					data: {
						search: this.movieName,
						movieId: this.movieId
					}
				})
				uni.hideLoading()
				if(res.errMsg === 'cloud.callFunction:ok') {
					let data = res.result
					if(data && data.videoName) {
						this.movieData = data || {}
						this.urlList = data.urlList
						if(this.urlList && this.urlList.length) {
							this.currentUrl = this.urlList[0].value
						}
					} else {
						this.noData = true
						uni.showToast({
							title: `抱歉，暂无视频播放源!`,
							icon: 'none',
						})
					}
				} else {
					console.log('error')
					uni.showToast({
						title: `抱歉，获取视频信息失败!`,
						icon: 'none',
					})
				}
			},
		},
		// 加了这个页面才可以被分享
		onShareAppMessage () {
		},
		async onLoad(data) {
			this.movieName = data.name
			this.movieId = data.movieId
			this.getData()
			uni.setNavigationBarTitle({
				title: data.name
			});
			this.videoContext = wx.createVideoContext('myVideo')
		},
	}
</script>

<style scoped lang="stylus">
@import "../../uni.styl"
.new-page
	display block
	width 100%
.video
	width 100%
	height calc(100vw * 0.75)
.source-box
	display block
	border-radius 10px
	background-color #fff
	padding 10px
	margin 5px
	.radio-box
		display block
		width 100%
		.radio
			border-bottom 1px solid $uni-border-color
			display block
			line-height 50px
.des-box
	display block
	border-radius 10px
	background-color #fff
	padding 10px
	margin 5px
	.content
		font-size 12px
</style>
