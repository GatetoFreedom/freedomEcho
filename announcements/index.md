---
layout: default
title: 公告
---

# 公告归档
> 汇总所有公告（按时间倒序）。

<div class="grid">
{% for post in site.posts %}
  <article class="card glass">
    <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%Y-%m-%d' }}</time>
    <p>{{ post.excerpt | strip_html | truncate: 120 }}</p>
  </article>
{% endfor %}
</div>
