---
layout: default
title: 公告
---

# 公告归档
> 汇总本群历次公告（按时间倒序）。占位文案。

<ul>
{% for post in site.posts %}
  <li>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    <small>（{{ post.date | date: '%Y-%m-%d' }}）</small>
  </li>
{% endfor %}
</ul>
