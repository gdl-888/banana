/*
'blockhistory': ['ismember', 'type', 'blocker', 'username', 'durationstring', 'startingdate', 'endingdate', 'al', 'blockview', 'fake', 'note']
'rb': ['block', 'end', 'today', 'blocker', 'why', 'band', 'ipacl'] 
*/

wiki.get('/BlockHistory', async function(req, res) {
	// 나무픽스
	if(req.query['target'] && req.query['query']) {
		if(!req.xhr) return res.send('올바르지 않은 작업입니다.');
		
		var content = '<div class=wiki-article style="display: none;"><ul class=wiki-list>';
		var dbdata;
		
		// 일단 기여내역 차단기록 검색만
		if(req.query['from']) {
			dbdata = await curs.execute("select ismember, type, blocker, username, startingdate, endingdate, note from blockhistory where username = ? startingdate <= ? order by cast(startingdate as integer) desc limit 100", [req.query['query'], req.query['from']]);
		}
		else if(req.query['until']) {
			dbdata = await curs.execute("select ismember, type, blocker, username, startingdate, endingdate, note from blockhistory where username = ? startingdate >= ? order by cast(startingdate as integer) desc limit 100", [req.query['query'], req.query['until']]);
		}
		else {
			dbdata = await curs.execute("select ismember, type, blocker, username, startingdate, endingdate, note from blockhistory order username = ? by cast(startingdate as integer) desc limit 100", [req.query['query']]);
		}
		
		for(var item of dbdata) {
			// 곧 할 예정
		}
		
		content += '</ul>' + navbtn('/BlockHistory?target=text&query=' + encodeURIComponent(req.query['query']), ) + '</div>';
	
		return res.send(content);
	}
	
	var dbdata;
	
	if(req.query['from']) {
		dbdata = await curs.execute("select ismember, type, blocker, username, startingdate, endingdate, note, blocker_type from blockhistory where startingdate <= ? order by cast(startingdate as integer) desc limit 100", [req.query['from']]);
	}
	else if(req.query['until']) {
		dbdata = await curs.execute("select ismember, type, blocker, username, startingdate, endingdate, note, blocker_type from blockhistory where startingdate >= ? order by cast(startingdate as integer) desc limit 100", [req.query['until']]);
	}
	else {
		dbdata = await curs.execute("select ismember, type, blocker, username, startingdate, endingdate, note, blocker_type from blockhistory order by cast(startingdate as integer) desc limit 100");
	}
	
	var content = `
		<table class="table table-hover">
			<colgroup>
				<col style="width: 200px;">
				<col style="width: 150px;">
				<col>
				<col>
				<col style="width: 200px;">
			</colgroup>
			
			<thead>
				<tr>
					<th>날짜</th>
					<th>유형</th>
					<th>실행자</th>
					<th>대상</th>
					<th>만료일</th>
				</tr>
			</thead>
			
			<tbody>
	`;
	
	var set = 0;
	
	var fd, ld;
	
	var trlist = '';
	
	for(var row of dbdata) {
		if(req.query['until']) {
			if(!set) {
				ld = row.startingdate; set = 1;
			}
			fd = row.startingdate;
		} else {
			if(!set) {
				fd = row.startingdate; set = 1;
			}
			ld = row.startingdate;
		}
		
		var data = `
			<tr>
				<td>${generateTime(toDate(row.startingdate), timeFormat)}</td>
				<td>${
					row.type == 'suspend' ? (
						'계정 차단'
					) : (
						row.type == 'unsuspend' ? (
							'계정 차단해제'
						) : (
							row.type == 'ipacl_add' ? (
								'IP 차단'
							) : (
								row.type == 'login_history' ? (
									'로그인 내역 조회'
								) : (
									row.type == 'grant' ? (
										'권한 부여'
									) : (
										row.type == 'ipacl_remove' ? (
											'IP 차단 해제'
										) : (
											'불분명'
										)
									)
								)
							)
						)
					)
				}</td>
				<td>${ip_pas(req, row.blocker, (row['blocker_type'] || 'author'))}</td>
				<td>${html.escape(row.username)}</td>
				<td>${
					row.endingdate == '0' ? (
						'무기한'
					) : (
						row.endingdate == '-1' ? (
							'해제'
						) : (
							generateTime(toDate(row.endingdate), timeFormat)
						)
					)
				}</td>
			</tr>
			
			<tr>
				<td colspan=5>
					${html.escape(row.note)}
				</td>
			</tr>
		`;
		
		if(req.query['until']) {
			trlist = data + trlist;
		} else trlist += data;
	}
	
	content += `
				${trlist}
			</tbody>
		</table>
		
		${navbtn('/BlockHistory', ld, fd)}
	`;
	
	res.send(await render(req, '차단 및 관리 기록', content, {}, _, _, 'blockhistory'));
});

wiki.get('/LegacyBlockHistory', async function(req, res) {
	var dbdata;
	
	if(req.query['from']) {
		dbdata = await curs.execute("select block, end, today, blocker, why, band, ipacl from rb where today <= ? order by today desc limit 100", [req.query['from']]);
	}
	else if(req.query['until']) {
		dbdata = await curs.execute("select block, end, today, blocker, why, band, ipacl from rb where today >= ? order by today asc limit 100", [req.query['until']]);
	}
	else {
		dbdata = await curs.execute("select block, end, today, blocker, why, band, ipacl from rb order by today desc limit 100");
	}
	
	var content = `
		<ul class=wiki-list>
	`;
	const cf = dbdata;
	
	var set = 0;
	
	var fd, ld;
	
	ullist = '';
	
	for(var row of cf) {
		if(req.query['until']) {
			if(!set) {
				ld = row.today; set = 1;
			}
			fd = row.today;
		} else {
			if(!set) {
				fd = row.today; set = 1;
			}
			ld = row.today;
		}
		
		var ldata = `
			<li>
				${generateTime(toDate(row.today), timeFormat)}
				${ip_pas(req, row.blocker, 'author')}가
				${row.block}
				${
					row.end == 'lh' ? (
						'사용자의 로그인 내역 조회'
					) : (
						row.end == 'grant' ? (
							'사용자에게 권한 부여'
						) : (
							row.end == 'release' ? (
								row.ipacl == '1' ? (
									'IP 차단 해제'
								) : (
									'사용자 차단 해제'
								)
							) : (
								row.ipacl == '1' ? (
									'IP 차단'
								) : (
									'사용자 차단'
								)
							)
						)
					)
				}
				${
					!(isNaN(Number(row.end))) ? (
						row.end == '0' ? (
							'(영구)'
						) : (
							'(' + row.end + '초 동안)'
						)
					) : ''
				}
				"${row.why}"
			</li>
		`;
		
		if(req.query['until']) ullist = ldata + ullist;
		else ullist += ldata;
	}
	
	content += `
			${ullist}
		</ul>
		
		${navbtn('/LegacyBlockHistory', ld, fd)}
	`;
	
	res.send(await render(req, '이전 차단 내역', content));
});