wiki.get('/admin/thread/:tnum/:id/show', async function showHiddenComment(req, res) {
	if(config.getString('disable_discuss', '0') == '1') {
		res.send(await showError(req, 'disabled_feature'));
		return;
	}
	
	const tnum = req.params["tnum"];
	const tid = req.params["id"];
	
	await curs.execute("select id from res where tnum = ?", [tnum]);
	
	const rescount = curs.fetchall().length;
	
	if(!rescount) { res.send(await showError(req, "thread_not_found")); return; }
	
	if((rs['username'] == ip_check(req) && rs['ismember'] == (islogin(req) ? 'author' : 'ip') && atoi(getTime()) - atoi(rs['time']) > 180000)) {
		res.send(await showError(req, 'h_time_expired'))
	}
	
	if(!getperm('hide_thread_comment', ip_check(req)) && !((getperm('hide_thread_comment', ip_check(req))) || (rs['username'] == ip_check(req) && rs['ismember'] == (islogin(req) ? 'author' : 'ip') && atoi(getTime()) - atoi(rs['time']) <= 180000))) {
		res.send(await showError(req, 'insufficient_privileges'));
		return;
	}
	
	curs.execute("update res set hidden = '0', hider = '' where tnum = ? and id = ?", [tnum, tid]);
	
	res.redirect('/thread/' + tnum);
});

wiki.get('/admin/thread/:tnum/:id/hide', async function hideComment(req, res) {
	if(config.getString('disable_discuss', '0') == '1') {
		res.send(await showError(req, 'disabled_feature'));
		return;
	}
	
	const tnum = req.params["tnum"];
	const tid = req.params["id"];
	
	await curs.execute("select id from res where tnum = ?", [tnum]);
	
	const rescount = curs.fetchall().length;
	
	if(!rescount) { res.send(await showError(req, "thread_not_found")); return; }
	
	if((rs['username'] == ip_check(req) && rs['ismember'] == (islogin(req) ? 'author' : 'ip') && atoi(getTime()) - atoi(rs['time']) > 180000)) {
		res.send(await showError(req, 'h_time_expired'))
	}
	
	if(!getperm('hide_thread_comment', ip_check(req)) && !((getperm('hide_thread_comment', ip_check(req))) || (rs['username'] == ip_check(req) && rs['ismember'] == (islogin(req) ? 'author' : 'ip') && atoi(getTime()) - atoi(rs['time']) <= 180000))) {
		res.send(await showError(req, 'insufficient_privileges'));
		return;
	}
	
	curs.execute("update res set hidden = '1', hider = ? where tnum = ? and id = ?", [ip_check(req), tnum, tid]);
	
	res.redirect('/thread/' + tnum);
});