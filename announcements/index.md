---
layout: default
title: 公告
---

# 公告归档
> 汇总所有公告（按时间倒序）。

<div class="grid ann-grid">
{% for post in paginator.posts %}
  <article class="card glass tilt">
    <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%Y-%m-%d' }}</time>
    <p>{{ post.excerpt | strip_html | truncate: 120 }}</p>
  </article>
{% endfor %}
</div>

<nav class="pager">
  {% if paginator.previous_page %}
    {% if paginator.previous_page == 1 %}
      <a class="btn pager-link" rel="prev" href="{{ '/announcements/' | relative_url }}">上一页</a>
    {% else %}
      <a class="btn pager-link" rel="prev" href="{{ '/announcements/page' | append: paginator.previous_page | append: '/' | relative_url }}">上一页</a>
    {% endif %}
  {% endif %}

  <span class="pager-meta">第 {{ paginator.page }} / {{ paginator.total_pages }} 页</span>

  {% if paginator.next_page %}
    <a class="btn pager-link" rel="next" href="{{ '/announcements/page' | append: paginator.next_page | append: '/' | relative_url }}">下一页</a>
  {% endif %}
</nav>
