/*!
 * @name Magick
 * @class 图片预处理组件，支持压缩、裁切与异步上传
 * @date: 2018/08/29
 * @see http://www.veryide.com/projects/magick/
 * @author Lay
 * @copyright VeryIDE
 * @constructor
 */
var Magick = {
	
	/**
	* @desc  合并数组，相同的键为替换，不同的键为新增
	* @param {Object} array1 数组1
	* @param {Object} array2 数组2
	* @param {Object} arrayN 数组N
	* @return {Object} 合并后的数组
	* @example
	* Magick.merge( { quality : 80, output : 'png' }, { unit : '%', output : 'jpg' } );
	*/
	merge : function() {
		var obj = {}, i = 0, il = arguments.length, key;
		for (; i < il; i++) {
			for (key in arguments[i]) {
				if (arguments[i].hasOwnProperty(key)) {
					obj[key] = arguments[i][key];
				}
			}
		}
		return obj;
	},
	
	/**
	* @desc  获取文件扩展名
	* @param {String} file 文件名称或路径地址
	* @return {String} 扩展名
	* @example
	* Magick.extra('hello.png');
	*/
	extra : function( file ){
		return file.split('.').pop().toLocaleLowerCase();
	},
	
	/**
	* @desc  获取文件的名称，省略路径
	* @param {String} file 文件名称或路径地址
	* @return {String} 文件名
	* @example
	* Magick.name('c://windows/hello.png');
	*/
	name : function( file ){
		return file.replace(/^.*[\\\/]/, '');
	},
	
	/**
	* @desc  获取流类型
	* @param {String} extra 文件扩展名
	* @return {String} 流类型
	* @example
	* Magick.mime('png');
	*/
	mime : function( extra ){
		var table = {
			'jpg' : 'image/jpeg',
			'jpeg' : 'image/jpeg',
			'gif' : 'image/gif',
			'png' : 'image/png'
		};
		if( extra && table[extra] ){
			return table[extra];
		}else{
			return table['png'];
		}
	},
	
	/**
	* @desc  当前时间戳
	* @return {Number} 时间戳
	* @example
	* Magick.time();
	*/
	time : function(){
		return new Date().getTime();	
	},
	
	/**
	* @desc  将 ASCII 字符串或二进制数据转换成 Base64 编码过的字符串
	* @return {String} string 字符串
	* @example
	* Magick.atob('hello world');
	*/
	atob : function( str ) {
		str = str.replace(/\s/g, '');
		return window.atob( str );
	},
	
	/**
	* @desc  打印调试信息
	* @param {String} msg 消息内容
	* @example
	* Magick.debug('test');
	*/
	debug : function( msg ){
		console && console.log( msg );
	},
	
	/**
	* @desc  打印全局（window）错误信息
	* @param {String}  str	   输入字符串
	* @param {String}  replace      替换字符串
	* @param {String}  start       参考 PHP 同名函数
	* @param {Number}    length      参考 PHP 同名函数
	*/
	substr_replace : function (str, replace, start, length) {
		if (start < 0) { // start position in str
			start = start + str.length;
		}
		length = length !== undefined ? length : str.length;
		if (length < 0) {
			length = length + str.length - start;
		}
		return str.slice(0, start) + replace.substr(0, length) + replace.slice(length) + str.slice(start + length);
	},
	
	/*
	* @desc	根据当前文件得到缩略图地址
	* @param {String} file	源文件
	* @param {String|Array} size	尺寸
	*/
	thumb : function ( file, size ){
		size = ( size instanceof Array ) ? size[0] + 'x' + size[1] : 'thumb';
		return file ? Magick.substr_replace( file, '!'+ size +'.', file.lastIndexOf('.'), 1 ) : '';
	},
	
	/*
	* @desc	添加到文件列表
	* @param {String} list	文件列表，以 || 分隔
	* @param {String} file	目标文件
	*/
	append : function( list, file ){
		return ( list ? list + '||' + file : file );
	},
	
	/*
	* @desc	从文件列表删除
	* @param {String} list	源文件，以 || 分隔
	* @param {String} file	目标文件
	*/
	remove : function( list, file ){
		var objs = list.split('||');
		for( var i in objs ){
			if( objs[i] == file ){
				objs.splice( i, 1 );
			}	
		}
		return objs.join('||');
	},
	
	/**
	 * @desc  压缩图片文件
	 * @param {Image} source	原图对象
	 * @param {Object} params	压缩参数
	 * @param {String} rawname	原始名称
	*/
	compress: function( source, params, rawname ){
		
		//压缩参数
		var option = { quality : 85, unit : '%', vrange : 'center', hrange : 'center', output : Magick.extra( rawname ) };
		if( params ) option = Magick.merge( option, params );
		
		//格式判断
		var mime = Magick.mime( option.output );
		this.debug( '文件流类型：' + mime );
		
		//原图尺寸
		var natural = { width : source.naturalWidth, height : source.naturalHeight };
		this.debug( '原图尺寸：' + natural.width + ' * ' + natural.height );
		
		///////////
			
		//计算缩放比例
		var ws = option.maxwidth ? ( option.maxwidth / natural.width ) : 1;
		var hs = option.maxheight ? ( option.maxheight / natural.height ) : 1;
	
		//最大尺寸限制
		if( ( option.maxwidth && natural.width > option.maxwidth ) && ( option.maxheight && natural.height > option.maxheight ) ){
			
			//宽度大于高度时，优先使用高度为缩放基数，反之亦然
			//计算需要从原图复制的尺寸，用于粘贴到新的画布上
			if( ws > hs ){
				option.height = option.maxheight;
				option.width = hs * natural.width;
			}else{
				option.width = option.maxwidth;
				option.height = ws * natural.height;
			}
			
		}else if( option.maxwidth || option.maxheight ){
			if( option.maxwidth && natural.width > option.maxwidth ){
				option.width = option.maxwidth;
				option.height = ws * natural.height;
			}
			if( option.maxheight && natural.height > option.maxheight ){
				option.height = option.maxheight;
				option.width = hs * natural.width;
			}
		}		
		
		///////////
		
		//计算缩放比例
		var ws = option.width / natural.width;
		var hs = option.height / natural.height;
		
		//计算裁切尺寸
		if( option.width && option.height ){
			
			//宽度大于高度时，优先使用高度为缩放基数，反之亦然
			//计算需要从原图复制的尺寸，用于粘贴到新的画布上
			if( ws > hs ){
				option.srcW = natural.width;
				option.srcH = option.height / ws;
			}else{
				option.srcH = natural.height;
				option.srcW = option.width / hs;
			}
			
			///////////
			
			//计算水平偏移量
			if( option.hrange == 'center' ){
				option.srcX = ( natural.width - option.srcW ) / 2;
			}else if( option.hrange == 'right' ){
				option.srcX = natural.width - option.srcW;
			}else{
				option.srcX = 0;	
			}
			
			///////////
			
			//计算垂直偏移量
			if( option.vrange == 'center' ){
				option.srcY = ( natural.height - option.srcH ) / 2;
			}else if( option.vrange == 'bottom' ){
				option.srcY = natural.height - option.srcH;
			}else{
				option.srcY = 0;	
			}
			
		//计算缩放尺寸
		}else if( option.width || option.height ){
			if( !option.height ){
				option.height = ws * natural.height;
			}				
			if( !option.width ){
				option.width = hs * natural.width;	
			}
			
			//使用百分比来计算图片缩放尺寸
			if( option.unit == '%' ){
				option.scale = ( option.width || option.height ) / 100;
				option.height = option.scale * natural.height;
				option.width = option.scale * natural.width;
			}
		}else{
			
			//原始尺寸
			option.width 	= natural.width;
			option.height	= natural.height;
			
		}
		
		this.debug( '目标尺寸：' + option.width + ' * ' + option.height );
		
		///////////
		
		//创建 Canvas 对象
		var cvs = document.createElement('canvas'),
			ctx = cvs.getContext("2d");
		
		//画布尺寸
		cvs.width = option.width;
		cvs.height = option.height;
		
		//旋转图片
		if( option.orientation ){

			this.debug( '处理图片旋转：' + option.orientation );

			switch( option.orientation ){

				//水平翻转
				case 2:
					ctx.translate( cvs.width, 0 );
					ctx.scale( -1, 1 ); 
				break;

				//180°
				case 3:
					ctx.translate( cvs.width, cvs.height);
					ctx.rotate( Math.PI ); 
				break;

				//垂直翻转
				case 4: 
					ctx.translate( 0, cvs.height );
					ctx.scale( 1, -1 ); 
				break;

				//顺时针90°+水平翻转
				case 5:
					ctx.rotate(0.5 * Math.PI);
					ctx.scale( 1, -1 ); 
				break;

				//顺时针90°
				case 6:
					ctx.rotate( 0.5 * Math.PI );
					ctx.translate( 0, -cvs.height ); 
				break;

				//顺时针90°+垂直翻转
				case 7:
					ctx.rotate( 0.5 * Math.PI );
					ctx.translate( cvs.width, -cvs.height );
					ctx.scale(-1,1); 
				break;

				//逆时针90°
				case 8:
					ctx.rotate( -0.5 * Math.PI );
					ctx.translate( -cvs.width, 0 ); 
				break;

			}
		}
		
		//根据坐标重绘图片
		if( option.srcW && option.srcH ){
			ctx.drawImage( source, option.srcX, option.srcY, option.srcW, option.srcH, 0, 0, option.width, option.height );
		}else{
			ctx.drawImage( source, 0, 0, option.width, option.height );
		}
		
		//获取图片数据
		var data = cvs.toDataURL( mime, option.quality / 100 );
		
		return data;
	},
	
	/**
	 * @desc  上传图片文件
	 * @param {Data}  	data 	图片数据
	 * @param {String} 	upload 	上传地址
	 * @param {Object} 	params 	配置参数
	 * @param {Object} 	event	触发事件
	 * @example
	 * //执行图片上传操作
	 * Magick.upload( data, 'upload.php', {}, {
	 * 
	 * 	//上传完成回调
	 * 	success : function( response ){
	 * 		console.log( JSON.parse( response ) );
	 * 	},
	 * 	
	 * 	//上传过程回调
	 * 	progress : function( percentage ){
	 * 		console.log( percentage + '%' );
	 * 	},
	 * 	
	 * 	//上传失败回调
	 * 	failure : function( response ){
	 * 		console.log( response );
	 * 	}
	 * 
	 * });
	*/
	upload: function( data, upload, params, event ){
		
		//压缩参数
		var option = { inputname : 'file', filename : 'unknown.png' };
		if( params ) option = Magick.merge( option, params );
		
		///////////
		
		//格式判断
		var mime = Magick.mime( Magick.extra( option.filename ) );
		this.debug( '上传文件流：' + mime );
		
		//过滤流标识（重要）
		data = data.replace(/data:image\/(.*);base64,/, '');
		this.debug( '文件流长度：' + data.length );
		
		///////////
		
		var xhr = new XMLHttpRequest();
		xhr.open('POST', upload, true);
		
		var boundary = 'someboundary';
		xhr.setRequestHeader('Content-Type', 'multipart/form-data; charset=x-user-defined boundary=' + boundary);
		
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 ) {
				if( this.status == 200 ){
					Magick.debug( '文件上传完成：' + this.responseText );
					Magick.debug( '---------------------------------' );
					event.success && event.success(this.responseText);
				}else{
					Magick.debug( '文件上传出错：' + this.responseText );
					Magick.debug( '---------------------------------' );
					event.failure && event.failure(this.responseText);
				}
			}
		};
		
		//显示进度
		if( xhr.upload ){
		
			xhr.upload.addEventListener("progress", function(e) { 
				if (e.lengthComputable) { 
					var percentage = Math.round((e.loaded * 100) / e.total);
					event.progress && event.progress( percentage );
				} 
			}, false);
		
		}
		
		///////////
		
		//图片数据
		var formdata = ['--' + boundary, 'Content-Disposition: form-data; name="' + option.inputname + '"; filename="' + encodeURIComponent( option.filename ) + '"', 'Content-Type: ' + mime, '', this.atob( data )];
		
		//表单数据
		if( option.formdata ){
			for( var k in option.formdata )	{
				formdata.push( '--' + boundary );
				formdata.push( 'Content-Disposition: form-data; name="'+ k +'"' );
				formdata.push( '' );
				formdata.push( option.formdata[k] );
			}
		}
		
		//数据结束
		formdata.push( '--' + boundary + '--' );
		
		///////////
		
		//ADD sendAsBinary compatibilty to older browsers
		if (XMLHttpRequest.prototype.sendAsBinary === undefined) {
			this.debug( '构建 xhf.sendAsBinary 方法' );
			XMLHttpRequest.prototype.sendAsBinary = function(string) {
				var bytes = Array.prototype.map.call(string, function(c) {
					return c.charCodeAt(0) & 0xff;
				});
				//高版本浏览器中可以省略 .buffer，但在微信中必需
				this.send(new Uint8Array(bytes).buffer);
			};
		}
		
		///////////
		
		xhr.sendAsBinary( formdata.join('\r\n') );

	},
	
	/**
	 * 处理器对旬
	 * @param {Event}  		e 		事件对象，兼容拖拽和浏览两种上传方式
	 * @param {Object} 		params	压缩参数
	 * @param {Object}		event	触发事件
	 * @example
	 * //对图片进行预处理，根据宽度和高度进行裁切
	 * Magick.parser( e, { width : 200, height : 200 },{
	 * 
	 * 	//文件类型出错时回调
	 * 	error : function( data ){
	 *		alert( '错误的文件类型：'+ data );
	 *	},
	 *
	 * 	//文件校验通过时回调
	 *	valid : function( data, image ){
	 *		
	 *		//执行图片上传操作
	 *		Magick.upload( data, 'upload.php', {}, {
	 *			
	 *			//...........
	 *			
	 *		} );
	 *	}
	 *	
	 *});
	 *
	 * //对图片进行缩放处理，根据宽度的 800px 来计算
	 * Magick.parser( e, { width : 800 },{
	 *			
	 *	//...........
	 *	
	 * });
	 *
	 * //对图片进行缩放处理，根据宽度的 80% 来计算
	 * Magick.parser( e, { width : 80, unit : '%' },{
	 *			
	 *	//...........
	 *	
	 * });
	 *
	 * //对图片尺寸进行限定，超过尺寸时将自动计算
	 * Magick.parser( e, { maxwidth : 800 },{
	 *			
	 *	//...........
	 *	
	 * });
	 *
	 * //导出图片质量 50，可以控制压缩大小
	 * Magick.parser( e, { quality : 50 },{
	 *			
	 *	//...........
	 *	
	 * });
	 *
	 * //启用兼容模式，部分 Android WebView 获取到的 data(.+?)base64 为空
	 * Magick.parser( e, { compat : true },{
	 *			
	 *	//...........
	 *	
	 * });
	*/
	parser: function( e, params, event ){
		
		e.preventDefault();

		//检查 FileReader 支持情况
		if( !window.FileReader ) {
			event.error && event.error( 'FileReader' );
			return false;
		}
		
		//兼容拖拽和浏览两种上传方式
		var port = e.dataTransfer || e.target;
		
		//文件数量
		var size = port.files.length;
		
		//没有或取消了上传文件
		if( size == 0 ){
			event.error && event.error( 'cancel', e.type );	
		}
		
		//处理多文件
		for( var i=0; i < size; i++ ){

			var file = port.files[i],
				reader = new FileReader();
			
			//仅处理图片类型
			if( !params.compat && !file.type.match('image.*') ) {
				event.error && event.error( 'format', Magick.extra( file.name ) );
				return false;
			}
			
			//限定文件大小（bytes）
			if( params.maximum && file.size > params.maximum ) {
				event.error && event.error( 'maximum', file.size );
				return false;
			}
			
			// Closure to capture the file information.
			reader.onload = (function( self ){
				return function(e) {
						
					//载入到临时图片
					var tmp = new Image();
					var src = e.target.result;
					
					//读取 EXIF 信息
					if( typeof EXIF != 'undefined' ){

						// 转换二进制数据
						var base64 = src.replace(/^.*?,/,'');
						var binary = Magick.atob(base64);
						var exif = EXIF.readFromBinaryFile( new BinaryFile( binary ) );

						params.orientation = exif.Orientation;
						Magick.debug( '当前图片方向：'+ params.orientation );
					}
					
					//兼容 Android
					if( params.compat && !/data:image\/(.*);base64,/.test( src ) ){
						src = src.replace( /data(.+?)base64/, 'data:image\/jpeg;base64' );
					}

					tmp.src = src;
						
					//处理错误回调
					tmp.onerror = function( e ){
						event.error && event.error( 'unknown', e.type );
					}
					
					//处理完成回调
					tmp.onload = function(){
				
						//对图片进行压缩
						var data = Magick.compress( this, params, self.name );
						
						//回调图片函数
						event.valid && event.valid( data, this, self.name );
				
					}

				};
			})(file);
			
			// Read in the image file as a data URL.
			reader.readAsDataURL( file );
		
		}
		
	}
	
}