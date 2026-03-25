/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate
} from 'react-router-dom';
import {
  Play, Pause, Volume2, VolumeX,
  Mic2, Share2, Maximize2,
  Instagram, Facebook, Twitter,
  Mail, Phone, MapPin, Send,
  Newspaper, Music2, X, Plus, Trash2,
  Lock, LogOut, Image, AlignLeft, Type,
  ExternalLink, RefreshCw, Calendar, Tv, Music,
  Radio, Star, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_NEWS, MOCK_CULTURE, MOCK_PROGRAMS, ProgramItem } from './constants';

// ─── Supabase config ──────────────────────────────────────
const SUPABASE_URL = 'https://aosnpsobjcezttdlyxfb.supabase.co';
const SUPABASE_ANON = 'sb_publishable_6xghNR2h4q-yzJjq8uqNZA_Gm0a54SI';
const ADMIN_PASSWORD = 'difusora2025'; // troque para sua senha

const sb = {
  async select(table: string = 'noticias') {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?select=*&order=${table === 'top_songs' ? 'rank.asc' : 'created_at.desc'}`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
    );
    if (!res.ok) throw new Error('Erro ao buscar');
    return res.json();
  },
  async insert(table: string, data: any) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao salvar');
    return res.json();
  },
  async delete(table: string, id: number) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    });
    if (!res.ok) throw new Error('Erro ao deletar');
  },
};

// ─── Types ────────────────────────────────────────────────
interface NewsItem {
  id: number;
  created_at: string;
  titulo: string;
  conteudo: string;
  imagem_url: string;
  autor: string;
}

interface AgendaItem {
  id: number;
  created_at: string;
  data: string;
  evento: string;
  local: string;
  conteudo?: string;
  imagem_url?: string;
  video_url?: string;
}

interface CultureItem {
  id: number;
  created_at: string;
  titulo: string;
  conteudo: string;
  imagem_url: string;
}

interface SongItem {
  id: number;
  rank: number;
  title: string;
  artist: string;
  cover: string;
  video_url?: string;
  conteudo?: string;
}

// ─── Dashboard Page ───────────────────────────────────────
function DashboardPage() {
  const navigate = useNavigate();
  const onBack = () => navigate('/player');
  const [authed, setAuthed] = useState(false);
  const [senha, setSenha] = useState('');
  const [senhaErro, setSenhaErro] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTable, setActiveTable] = useState<'noticias' | 'agenda' | 'entretenimento' | 'top_songs'>('noticias');
  const [form, setForm] = useState<any>({ 
    titulo: '', conteudo: '', imagem_url: '', autor: '', 
    data: '', evento: '', local: '', 
    rank: '', title: '', artist: '', cover: '', video_url: '' 
  });
  const [tab, setTab] = useState<'lista' | 'nova'>('lista');
  const [feedback, setFeedback] = useState('');

  const login = () => {
    if (senha === ADMIN_PASSWORD) { setAuthed(true); loadData('noticias'); }
    else { setSenhaErro(true); setTimeout(() => setSenhaErro(false), 1500); }
  };

  const loadData = async (table: string) => {
    setLoading(true);
    try { setItems(await sb.select(table)); } catch { } finally { setLoading(false); }
  };

  useEffect(() => {
    if (authed) {
      loadData(activeTable);
      setTab('lista');
    }
  }, [activeTable, authed]);

  const save = async () => {
    if (activeTable === 'noticias' || activeTable === 'entretenimento') {
      if (!form.titulo?.trim() || !form.conteudo?.trim()) {
        setFeedback('Título e conteúdo são obrigatórios.');
        setTimeout(() => setFeedback(''), 3000);
        return;
      }
    } else if (activeTable === 'agenda') {
      if (!form.evento?.trim() || !form.data?.trim()) {
        setFeedback('Evento e data são obrigatórios.');
        setTimeout(() => setFeedback(''), 3000);
        return;
      }
    }

    setSaving(true);
    try {
      let payload: any = {};
      if (activeTable === 'agenda') {
        payload = { 
          evento: form.evento, data: form.data, local: form.local, 
          conteudo: form.conteudo, imagem_url: form.imagem_url, video_url: form.video_url 
        };
      } else if (activeTable === 'top_songs') {
        payload = { 
          rank: parseInt(form.rank), title: form.title, artist: form.artist, 
          cover: form.cover, video_url: form.video_url, conteudo: form.conteudo 
        };
      } else {
        payload = { titulo: form.titulo, conteudo: form.conteudo, imagem_url: form.imagem_url, autor: form.autor };
      }
      
      await sb.insert(activeTable, payload);
      setForm({ 
        titulo: '', conteudo: '', imagem_url: '', autor: '', 
        data: '', evento: '', local: '', 
        rank: '', title: '', artist: '', cover: '', video_url: '' 
      });
      setFeedback('Publicado com sucesso!');
      setTimeout(() => setFeedback(''), 3000);
      setTab('lista');
      loadData(activeTable);
    } catch { setFeedback('Erro ao salvar.'); setTimeout(() => setFeedback(''), 3000); }
    finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm('Excluir este item?')) return;
    try { await sb.delete(activeTable, id); loadData(activeTable); } catch { }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getTableTitle = () => {
    switch(activeTable) {
      case 'noticias': return 'Notícias';
      case 'agenda': return 'Agenda';
      case 'entretenimento': return 'Entretenimento';
      case 'top_songs': return 'Top 5 Difusora';
      default: return 'Dashboard';
    }
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  // ── Tela de login ──
  if (!authed) return (
    <motion.div key="dashboard-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 bg-[#0a0a0a]">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all">
            <X size={18} />
          </button>
          <img src="https://i.postimg.cc/fWdv55vc/LOGO-PP-(1).png" alt="Logo" className="h-20 w-auto object-contain" referrerPolicy="no-referrer" />
          <div className="w-9" />
        </div>

        <div className="bg-[#141414] rounded-3xl border border-white/5 p-6 space-y-5 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-400/20 flex items-center justify-center">
              <Lock size={16} className="text-orange-400" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Painel Dashboard</p>
              <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Difusora 104.3</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-white/35">Senha de Acesso</label>
            <input
              type="password" value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 outline-none transition-all text-white placeholder:text-white/20 text-sm ${senhaErro ? 'border-red-500/60 bg-red-500/5' : 'border-white/10 focus:border-orange-400/50'}`}
              placeholder="••••••••"
            />
            {senhaErro && <p className="text-red-500 text-[10px] font-medium">Senha incorreta, tente novamente.</p>}
          </div>

          <button onClick={login}
            className="w-full py-4 rounded-xl font-bold tracking-wider uppercase text-xs bg-orange-500 text-white transition-all active:scale-[0.98] hover:bg-orange-400 shadow-lg shadow-orange-900/20">
            Acessar Painel
          </button>
        </div>
      </div>
    </motion.div>
  );

  // ── Painel Dashboard (Sidebar Layout) ──
  return (
    <motion.div key="dashboard-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative z-10 flex min-h-screen bg-[#0a0a0a] text-white">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-900/40">
              <Radio size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Difusora</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">104.3 FM • PAINEL</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'noticias', label: 'Notícias', icon: Newspaper },
            { id: 'agenda', label: 'Agenda', icon: Calendar },
            { id: 'entretenimento', label: 'Entretenimento', icon: Star },
            { id: 'top_songs', label: 'Top 5 Difusora', icon: Music2 },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTable(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTable === item.id ? 'bg-orange-500/10 text-orange-400 border border-orange-400/20' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon size={18} className={activeTable === item.id ? 'text-orange-400' : 'text-white/30'} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => { setAuthed(false); setSenha(''); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Gestão de {getTableTitle()}</h1>
            <p className="text-xs text-white/30 font-medium capitalize">{getTodayDate()}</p>
          </div>

          <div className="flex items-center gap-4">
            {feedback && (
              <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {feedback}
              </div>
            )}
            <button
              onClick={() => setTab(tab === 'lista' ? 'nova' : 'lista')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold transition-all active:scale-95 shadow-lg shadow-orange-900/20"
            >
              {tab === 'lista' ? <><Plus size={18} /> Nova {activeTable === 'noticias' ? 'notícia' : activeTable === 'agenda' ? 'agenda' : activeTable === 'entretenimento' ? 'entretenimento' : 'música'}</> : <><List size={18} /> Ver Lista</>}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          
          {tab === 'lista' && (
            <div className="space-y-8">
              {/* Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-400/20 flex items-center justify-center">
                    <Newspaper size={20} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold leading-none">{items.length}</p>
                    <p className="text-xs text-white/40 font-medium mt-1">Total publicadas</p>
                  </div>
                </div>
              </div>

              {/* List Section */}
              <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold">{getTableTitle()} publicadas</h2>
                    <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">{items.length} itens no banco de dados</p>
                  </div>
                  <button onClick={() => loadData(activeTable)} className="p-2 text-white/20 hover:text-white transition-colors">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  </button>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="flex justify-center py-20">
                      <div className="w-8 h-8 rounded-full border-2 border-white/5 border-t-orange-400 animate-spin" />
                    </div>
                  ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                        <Newspaper size={32} className="text-white/10" />
                      </div>
                      <p className="text-white/40 font-bold">Nenhuma {activeTable === 'noticias' ? 'notícia' : 'item'} publicado</p>
                      <p className="text-xs text-white/20 mt-1">Clique em "Nova {activeTable === 'noticias' ? 'notícia' : 'item'}" para começar</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {items.map(item => (
                        <div key={item.id} className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-all">
                          {item.imagem_url || item.cover ? (
                            <img src={item.imagem_url || item.cover} className="w-16 h-16 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                              <Image size={24} className="text-white/10" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate">{item.titulo || item.evento || item.title}</h3>
                            <p className="text-xs text-white/40 truncate mt-0.5">{item.conteudo || item.local || item.artist}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">{formatDate(item.created_at)}</span>
                              {item.rank && <span className="text-[9px] font-bold uppercase tracking-widest text-orange-400">Rank #{item.rank}</span>}
                            </div>
                          </div>
                          <button onClick={() => remove(item.id)} className="p-2.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'nova' && (
            <div className="max-w-3xl">
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-400/20 flex items-center justify-center">
                    <Plus size={20} className="text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Adicionar Novo Item</h2>
                    <p className="text-xs text-white/30 font-medium tracking-tight">Preencha os campos abaixo para publicar em {getTableTitle()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTable === 'agenda' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Evento *</label>
                        <input type="text" value={form.evento || ''} onChange={e => setForm((f: any) => ({ ...f, evento: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all text-white text-sm" placeholder="Nome do evento..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Data *</label>
                        <input type="text" value={form.data || ''} onChange={e => setForm((f: any) => ({ ...f, data: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all text-white text-sm" placeholder="Ex: 20 de Outubro" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Local</label>
                        <input type="text" value={form.local || ''} onChange={e => setForm((f: any) => ({ ...f, local: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all text-white text-sm" placeholder="Local do evento..." />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Descrição</label>
                        <textarea value={form.conteudo || ''} onChange={e => setForm((f: any) => ({ ...f, conteudo: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all h-32 resize-none text-white text-sm" placeholder="Detalhes do evento..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">URL da Imagem</label>
                        <input type="url" value={form.imagem_url || ''} onChange={e => setForm((f: any) => ({ ...f, imagem_url: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all text-white text-sm" placeholder="https://..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">URL do Vídeo (YouTube)</label>
                        <input type="url" value={form.video_url || ''} onChange={e => setForm((f: any) => ({ ...f, video_url: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all text-white text-sm" placeholder="https://youtube.com/watch?v=..." />
                      </div>
                    </>
                  ) : activeTable === 'top_songs' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Posição (1-5) *</label>
                        <input type="number" value={form.rank || ''} onChange={e => setForm((f: any) => ({ ...f, rank: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all text-white text-sm" placeholder="1" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Música *</label>
                        <input type="text" value={form.title || ''} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all text-white text-sm" placeholder="Nome da música..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Artista *</label>
                        <input type="text" value={form.artist || ''} onChange={e => setForm((f: any) => ({ ...f, artist: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all text-white text-sm" placeholder="Nome do artista..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Capa (URL)</label>
                        <input type="url" value={form.cover || ''} onChange={e => setForm((f: any) => ({ ...f, cover: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all text-white text-sm" placeholder="https://..." />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">URL do Vídeo (YouTube)</label>
                        <input type="url" value={form.video_url || ''} onChange={e => setForm((f: any) => ({ ...f, video_url: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all text-white text-sm" placeholder="https://youtube.com/watch?v=..." />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Curiosidade / Letra</label>
                        <textarea value={form.conteudo || ''} onChange={e => setForm((f: any) => ({ ...f, conteudo: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all h-32 resize-none text-white text-sm" placeholder="Conte algo sobre a música..." />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Título *</label>
                        <input type="text" value={form.titulo || ''} onChange={e => setForm((f: any) => ({ ...f, titulo: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all text-white text-sm" placeholder="Título da publicação..." />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Conteúdo *</label>
                        <textarea value={form.conteudo || ''} onChange={e => setForm((f: any) => ({ ...f, conteudo: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all h-48 resize-none text-white text-sm" placeholder="Escreva o conteúdo aqui..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">URL da Imagem</label>
                        <input type="url" value={form.imagem_url || ''} onChange={e => setForm((f: any) => ({ ...f, imagem_url: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all text-white text-sm" placeholder="https://..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Autor / Fonte</label>
                        <input type="text" value={form.autor || ''} onChange={e => setForm((f: any) => ({ ...f, autor: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-red-500/50 outline-none transition-all text-white text-sm" placeholder="Ex: Redação Difusora" />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 flex gap-3">
                  <button onClick={() => setTab('lista')} className="flex-1 py-4 rounded-xl font-bold tracking-wider uppercase text-xs bg-white/5 text-white/60 hover:bg-white/10 transition-all">
                    Cancelar
                  </button>
                  <button onClick={save} disabled={saving}
                    className="flex-[2] py-4 rounded-xl font-bold tracking-wider uppercase flex items-center justify-center gap-2 text-xs bg-orange-500 text-white transition-all active:scale-[0.98] hover:bg-orange-400 disabled:opacity-50 shadow-lg shadow-orange-900/20">
                    {saving ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <><Plus size={16} /> Publicar Agora</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </motion.div>
  );
}

// ─── News Page ────────────────────────────────────────────
function NewsPage() {
  const navigate = useNavigate();
  const onBack = () => navigate('/player');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NewsItem | null>(null);

  useEffect(() => {
    sb.select()
      .then((data) => setNews(data.length > 0 ? data : MOCK_NEWS))
      .catch(() => setNews(MOCK_NEWS))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  return (
    <>
      <motion.div key="news" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
        className="relative z-10 flex flex-col min-h-screen">
        <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 md:py-4 shrink-0"
            style={{ background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' }}>
            <div className="w-10" />
            <img src="https://i.postimg.cc/fWdv55vc/LOGO-PP-(1).png" alt="Logo" className="h-12 md:h-20 w-auto object-contain" referrerPolicy="no-referrer" />
            <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/15 transition-all active:scale-95">
              <X size={20} />
            </button>
          </div>

          {/* Title */}
          <div className="px-4 pb-4 shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <Music2 size={18} className="text-orange-400" />
              <h2 className="text-2xl font-bold tracking-tight">Notícias</h2>
            </div>
            <p className="text-white/40 text-xs tracking-wide">Novidades da Difusora 104.3</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-8 no-scrollbar">

            {loading && (
              <div className="flex justify-center py-20">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 rounded-full border-2 border-white/10 border-t-orange-500" />
              </div>
            )}

            {!loading && news.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Newspaper size={28} className="text-white/20" />
                </div>
                <div>
                  <p className="text-white/50 font-medium">Sem notícias ainda</p>
                  <p className="text-white/25 text-sm mt-1">Em breve a equipe da Difusora publicará novidades aqui.</p>
                </div>
              </div>
            )}

            {!loading && news.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                {/* Destaque */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelected(news[0])}
                  className="col-span-2 sm:col-span-3 rounded-2xl overflow-hidden bg-white/8 border border-white/10 hover:bg-white/12 transition-all active:scale-[0.99] cursor-pointer group">
                  {news[0].imagem_url && (
                    <div className="relative w-full aspect-video overflow-hidden">
                      <img src={news[0].imagem_url} alt={news[0].titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white border border-orange-500/40"
                        style={{ background: 'linear-gradient(135deg,#f97316cc,#ea580ccc)' }}>Destaque</span>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-bold text-sm leading-snug line-clamp-2">{news[0].titulo}</p>
                    <p className="text-white/40 text-xs mt-1.5 line-clamp-2">{news[0].conteudo}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                      {news[0].autor && <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{news[0].autor}</span>}
                      {news[0].autor && <span className="text-white/20 text-[9px]">·</span>}
                      <span className="text-[9px] text-white/30">{formatDate(news[0].created_at)}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Demais cards */}
                {news.slice(1).map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * (i + 1) }}
                    onClick={() => setSelected(item)}
                    className="rounded-2xl overflow-hidden bg-white/8 border border-white/10 hover:bg-white/12 transition-all active:scale-[0.98] cursor-pointer group flex flex-col">
                    <div className="relative w-full aspect-video overflow-hidden bg-white/5">
                      {item.imagem_url ? (
                        <img src={item.imagem_url} alt={item.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={e => {
                            const el = e.target as HTMLImageElement;
                            el.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.12)' stroke-width='1.5'><path d='M9 18V5l12-2v13'/><circle cx='6' cy='18' r='3'/><circle cx='18' cy='16' r='3'/></svg></div>`;
                          }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music2 size={22} className="text-white/12" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <p className="text-xs font-bold leading-snug line-clamp-3 flex-1">{item.titulo}</p>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-[9px] text-white/30">{formatDate(item.created_at)}</span>
                        <ExternalLink size={10} className="text-white/20" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setSelected(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-md sm:rounded-[2rem] rounded-t-[2rem] overflow-hidden"
              style={{ background: 'linear-gradient(180deg,#1a0a0a 0%,#0a0a0a 100%)', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '85vh' }}>

              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              <div className="overflow-y-auto no-scrollbar pb-8" style={{ maxHeight: 'calc(85vh - 20px)' }}>
                {selected.imagem_url && (
                  <div className="relative w-full aspect-video overflow-hidden">
                    <img src={selected.imagem_url} alt={selected.titulo} className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  </div>
                )}

                <div className="px-5 pt-4 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {selected.autor && (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white border border-red-500/30"
                        style={{ background: 'linear-gradient(135deg,#c41e1015,#8b120815)' }}>
                        {selected.autor}
                      </span>
                    )}
                    <span className="text-[10px] text-white/40">{formatDate(selected.created_at)}</span>
                  </div>

                  <h3 className="text-lg font-bold leading-snug">{selected.titulo}</h3>
                  <p className="text-white/65 text-sm leading-relaxed whitespace-pre-line">{selected.conteudo}</p>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/8 space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Publicado por</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-950/60 border border-red-800/30 flex items-center justify-center shrink-0">
                        <Newspaper size={14} className="text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{selected.autor || 'Difusora 104.3'}</p>
                        <p className="text-[10px] text-white/35 mt-0.5">{formatDate(selected.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setSelected(null)}
                    className="w-full py-3.5 rounded-2xl text-sm font-bold text-white/50 bg-white/5 border border-white/10 hover:bg-white/8 transition-all">
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Programs Page ─────────────────────────────────────────
function ProgramsPage({ onPlay }: { onPlay: () => void }) {
  const navigate = useNavigate();
  const onNavigate = (p: string) => {
    if (p === 'landing') navigate('/');
    else if (p === 'news') navigate('/news');
    else if (p === 'programs') navigate('/programs');
    else if (p === 'podcast') navigate('/podcast');
    else if (p === 'contact') navigate('/contact');
    else if (p === 'dashboard') navigate('/dashboard');
  };

  return (
    <motion.div key="programs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-[#f8f9fa] text-slate-900 overflow-y-auto transition-colors duration-500 flex flex-col">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-30 w-full h-16 md:h-20 flex items-center justify-between px-4 md:px-10 shadow-xl backdrop-blur-md transition-all shrink-0"
        style={{ backgroundColor: '#e94700' }}>
        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
        <img src="https://i.postimg.cc/fWdv55vc/LOGO-PP-(1).png" alt="Logo" className="h-10 md:h-12 w-auto object-contain cursor-pointer relative z-10" 
          onClick={() => onNavigate('landing')} referrerPolicy="no-referrer" />
        
        <div className="flex items-center gap-3 md:gap-6">
          <nav className="hidden md:flex items-center gap-6 text-white text-xs font-bold uppercase tracking-widest relative z-10">
            <button onClick={() => onNavigate('news')} className="hover:text-white/80 transition-colors">Notícias</button>
            <button onClick={() => onNavigate('programs')} className="hover:text-white/80 transition-colors">Programas</button>
            <button onClick={() => onNavigate('podcast')} className="hover:text-white/80 transition-colors">Estúdio ao Vivo</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-white/80 transition-colors">Contato</button>
          </nav>
          
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onPlay}
            className="relative z-10 flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-white text-black font-bold text-[10px] md:text-sm shadow-xl transition-all">
            <Play size={14} className="md:w-4 md:h-4" fill="black" /> 
            <span className="hidden xs:inline">OUVIR AGORA</span>
            <span className="xs:hidden">OUVIR</span>
          </motion.button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 flex-1 w-full">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shrink-0">
              <Radio size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Nossos Programas</h2>
              <p className="text-slate-500 text-sm mt-1">Acompanhe a programação da Difusora 104.3</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} 
            className="hidden md:flex px-5 py-2.5 rounded-full bg-white text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-orange-50 hover:text-orange-600 transition-all items-center gap-2 border border-slate-200 shadow-sm">
            <X size={14} /> Voltar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {MOCK_PROGRAMS.map((program, index) => (
            <motion.article key={program.id} 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
              className="group flex flex-col sm:flex-row items-center gap-5 md:gap-6 p-3 md:p-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-orange-900/5 hover:border-orange-200 transition-all duration-500 cursor-pointer">
              
              <div className="w-full sm:w-40 aspect-video sm:aspect-square rounded-[1.5rem] overflow-hidden bg-slate-100 relative shrink-0">
                <img src={program.logoUrl} alt={program.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              <div className="flex-1 min-w-0 w-full py-2 px-2 sm:px-0">
                <h3 className="font-bold text-xl md:text-2xl text-slate-800 mb-4 group-hover:text-orange-600 transition-colors leading-tight tracking-tight">{program.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
                      <Calendar size={14} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <span className="text-sm font-medium tracking-wide">{program.schedule}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
                      <Mic2 size={14} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <span className="text-sm font-medium tracking-wide">{program.announcer}</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden sm:flex w-12 h-12 rounded-full border border-slate-100 items-center justify-center text-slate-300 group-hover:text-orange-500 group-hover:border-orange-200 group-hover:bg-orange-50 transition-all shrink-0 mr-4">
                <Play size={16} className="ml-1" />
              </div>
            </motion.article>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 md:py-16 px-6 shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img src="https://i.postimg.cc/fWdv55vc/LOGO-PP-(1).png" alt="Logo" className="h-10 md:h-12 w-auto grayscale opacity-40 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
            <p className="text-slate-400 text-[10px] md:text-xs font-medium text-center md:text-left">© 2026 Difusora Colatina 104.3 FM.<br className="md:hidden" /> Todos os direitos reservados.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
            <button onClick={() => onNavigate('news')} className="hover:text-orange-600 transition-colors">Notícias</button>
            <button onClick={() => onNavigate('programs')} className="hover:text-orange-600 transition-colors">Programas</button>
            <button onClick={() => onNavigate('podcast')} className="hover:text-orange-600 transition-colors">Estúdio ao Vivo</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-orange-600 transition-colors">Contato</button>
            <button onClick={() => onNavigate('dashboard')} className="hover:text-orange-600 transition-colors text-orange-600/50">Dashboard</button>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

// ─── Landing Page ─────────────────────────────────────────
function LandingPage({ onPlay }: { onPlay: () => void }) {
  const navigate = useNavigate();
  const [showAllNews, setShowAllNews] = useState(false);
  const onNavigate = (p: string) => {
    if (p === 'landing') {
      setShowAllNews(false);
      navigate('/');
    }
    else if (p === 'news') {
      setShowAllNews(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    else if (p === 'home') navigate('/player');
    else if (p === 'admin') navigate('/dashboard');
    else navigate(`/${p}`);
  };
  const [news, setNews] = useState<NewsItem[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [culture, setCulture] = useState<CultureItem[]>([]);
  const [topSongs, setTopSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [n, a, c, s] = await Promise.all([
          sb.select('noticias'),
          sb.select('agenda'),
          sb.select('entretenimento'),
          sb.select('top_songs')
        ]);
        
        setNews(n.length > 0 ? n : MOCK_NEWS);
        setAgenda(a.length > 0 ? a : [
          { id: -1, created_at: new Date().toISOString(), data: "25 Março", evento: "Show de Talentos Regional", local: "Teatro Municipal" },
          { id: -2, created_at: new Date().toISOString(), data: "28 Março", evento: "Feira Gastronômica", local: "Praça Central" },
          { id: -3, created_at: new Date().toISOString(), data: "02 Abril", evento: "Maratona Difusora", local: "Beira Rio" }
        ]);
        setCulture(c.length > 0 ? c : MOCK_CULTURE);
        setTopSongs(s.length > 0 ? s : [
          { id: 1, rank: 1, title: "Flowers", artist: "Miley Cyrus", cover: "https://picsum.photos/seed/flowers/100/100" },
          { id: 2, rank: 2, title: "As It Was", artist: "Harry Styles", cover: "https://picsum.photos/seed/asitwas/100/100" },
          { id: 3, rank: 3, title: "Creepin'", artist: "Metro Boomin", cover: "https://picsum.photos/seed/creepin/100/100" },
          { id: 4, rank: 4, title: "Kill Bill", artist: "SZA", cover: "https://picsum.photos/seed/killbill/100/100" },
          { id: 5, rank: 5, title: "Anti-Hero", artist: "Taylor Swift", cover: "https://picsum.photos/seed/antihero/100/100" },
        ]);
      } catch {
        setNews(MOCK_NEWS);
        setAgenda([]);
        setCulture(MOCK_CULTURE);
        setTopSongs([]);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const featured = news[0];
  const general = news.slice(1);

  return (
    <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={`min-h-screen ${showAllNews ? 'bg-white' : 'bg-[#f8f9fa]'} text-slate-900 overflow-y-auto transition-colors duration-500`}>
      
      {/* Header Bar */}
      <header className="sticky top-0 z-30 w-full h-16 md:h-20 flex items-center justify-between px-4 md:px-10 shadow-xl backdrop-blur-md transition-all"
        style={{ backgroundColor: '#e94700' }}>
        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
        <img src="https://i.postimg.cc/fWdv55vc/LOGO-PP-(1).png" alt="Logo" className="h-10 md:h-12 w-auto object-contain cursor-pointer relative z-10" 
          onClick={() => onNavigate('landing')} referrerPolicy="no-referrer" />
        
        <div className="flex items-center gap-3 md:gap-6">
          <nav className="hidden md:flex items-center gap-6 text-white text-xs font-bold uppercase tracking-widest">
            <button onClick={() => onNavigate('news')} className="hover:text-white/80 transition-colors">Notícias</button>
            <button onClick={() => onNavigate('programs')} className="hover:text-white/80 transition-colors">Programas</button>
            <button onClick={() => onNavigate('podcast')} className="hover:text-white/80 transition-colors">Estúdio ao Vivo</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-white/80 transition-colors">Contato</button>
          </nav>
          
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onPlay}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-white text-black font-bold text-[10px] md:text-sm shadow-xl transition-all">
            <Play size={14} className="md:w-4 md:h-4" fill="black" /> 
            <span className="hidden xs:inline">OUVIR AGORA</span>
            <span className="xs:hidden">OUVIR</span>
          </motion.button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          
          {/* News Section */}
          <div className="lg:col-span-8 space-y-8 md:space-y-12">
            
            {showAllNews ? (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)]" />
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight uppercase text-slate-800">Todas as Notícias</h2>
                  </div>
                  <button onClick={() => { setShowAllNews(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                    className="px-4 py-2 rounded-full bg-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center gap-2 border border-slate-200">
                    <X size={12} /> Voltar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {/* Destaque in "Ver todas" */}
                  {news.length > 0 && (
                    <article onClick={() => setSelected(news[0])}
                      className="md:col-span-2 bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-200 hover:border-orange-200 hover:shadow-xl transition-all group cursor-pointer flex flex-col lg:flex-row">
                      {news[0].imagem_url && (
                        <div className="lg:w-1/2 aspect-video lg:aspect-auto overflow-hidden">
                          <img src={news[0].imagem_url} alt={news[0].titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                      )}
                      <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
                        <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-widest mb-4 inline-block w-fit border border-orange-100">Destaque</span>
                        <h3 className="font-bold text-2xl md:text-3xl mb-4 group-hover:text-orange-600 transition-colors leading-tight">{news[0].titulo}</h3>
                        <p className="text-slate-500 text-sm md:text-base line-clamp-4 leading-relaxed mb-8">{news[0].conteudo}</p>
                        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-orange-500" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {new Date(news[0].created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                          <ExternalLink size={16} className="text-slate-300 group-hover:text-orange-400 transition-colors" />
                        </div>
                      </div>
                    </article>
                  )}

                  {/* Rest of the news */}
                  {news.slice(1).map(item => (
                    <article key={item.id} onClick={() => setSelected(item)}
                      className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 hover:border-orange-200 hover:shadow-lg transition-all group cursor-pointer flex flex-col">
                      {item.imagem_url && (
                        <div className="aspect-video overflow-hidden">
                          <img src={item.imagem_url} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={e => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/news/400/225'; }} />
                        </div>
                      )}
                      <div className="p-6 md:p-8 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg md:text-xl mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">{item.titulo}</h3>
                        <p className="text-slate-500 text-xs md:text-sm line-clamp-3 leading-relaxed flex-1">{item.conteudo}</p>
                        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                          <ExternalLink size={14} className="text-slate-300 group-hover:text-orange-400 transition-colors" />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : (
              <>
                {/* Featured News */}
                <section>
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-orange-600 rounded-full" />
                      <h2 className="text-xl md:text-2xl font-bold tracking-tight uppercase text-slate-800">Destaque</h2>
                    </div>
                    <button onClick={() => setShowAllNews(true)} className="text-[10px] font-bold uppercase tracking-widest text-orange-600 hover:underline">Ver todas</button>
                  </div>
                  
                  {loading ? (
                    <div className="h-64 md:h-96 bg-white rounded-3xl animate-pulse" />
                  ) : featured ? (
                    <article className="group cursor-pointer bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200"
                      onClick={() => setSelected(featured)}>
                      <div className="relative aspect-video md:aspect-[21/9] overflow-hidden">
                        <img src={featured.imagem_url} alt={featured.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          onError={e => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/news/800/400'; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        <div className="absolute bottom-4 md:bottom-6 left-5 md:left-8 right-5 md:right-8">
                          <span className="px-2.5 py-0.5 rounded-full bg-orange-600 text-white text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-2 md:mb-3 inline-block">Notícia Principal</span>
                          <h3 className="text-white text-lg md:text-3xl font-bold leading-tight line-clamp-2">{featured.titulo}</h3>
                        </div>
                      </div>
                    </article>
                  ) : (
                    <div className="p-8 md:p-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-300 flex flex-col items-center gap-3">
                      <Newspaper size={32} className="text-slate-200" />
                      <p className="text-slate-400 text-sm font-medium">Nenhuma notícia em destaque no momento.</p>
                    </div>
                  )}
                </section>
                
                {/* Entertainment and Culture */}
                <section>
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="w-1.5 h-6 bg-orange-600 rounded-full" />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight uppercase text-slate-800">Entretenimento</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {culture.length > 0 ? culture.map(item => (
                      <article key={item.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 hover:border-orange-200 hover:shadow-md transition-all group cursor-pointer"
                        onClick={() => setSelected(item)}>
                        {item.imagem_url && (
                          <div className="aspect-video overflow-hidden">
                            <img src={item.imagem_url} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <div className="p-5 md:p-6">
                          <h3 className="font-bold text-base md:text-lg mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">{item.titulo}</h3>
                          <p className="text-slate-500 text-xs md:text-sm line-clamp-3 leading-relaxed">{item.conteudo}</p>
                        </div>
                      </article>
                    )) : (
                      <div className="col-span-1 md:col-span-2 p-8 md:p-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-300 flex flex-col items-center gap-3">
                        <Music2 size={32} className="text-slate-200" />
                        <p className="text-slate-400 text-sm font-medium">Nenhum conteúdo de entretenimento disponível.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* General News */}
                <section>
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight uppercase text-slate-800">Últimas Notícias</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {loading ? (
                      [1,2,3,4].map(i => <div key={i} className="h-32 md:h-40 bg-white rounded-2xl animate-pulse" />)
                    ) : general.length > 0 ? (
                      general.map(item => (
                        <article key={item.id} onClick={() => setSelected(item)}
                          className="flex gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-[1.5rem] md:rounded-2xl border border-slate-200 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                            <img src={item.imagem_url} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              onError={e => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/news/200/200'; }} />
                          </div>
                          <div className="flex flex-col justify-center min-w-0">
                            <h4 className="font-bold text-xs md:text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">{item.titulo}</h4>
                            <p className="text-[9px] md:text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">
                              {new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                            </p>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="col-span-1 md:col-span-2 p-8 md:p-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-300 flex flex-col items-center gap-3">
                        <Newspaper size={32} className="text-slate-200" />
                        <p className="text-slate-400 text-sm font-medium">Mais notícias em breve.</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6 md:space-y-8">
            {/* Agenda */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg text-slate-800 leading-tight">Agenda</h3>
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Eventos da Região</p>
                </div>
              </div>
              
              <div className="space-y-4 md:space-y-5">
                {agenda.length > 0 ? agenda.map(item => (
                  <div key={item.id} onClick={() => setSelected(item)}
                    className="flex gap-3 md:gap-4 group cursor-pointer">
                    <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center group-hover:bg-orange-600 group-hover:border-orange-500 transition-all">
                      <span className="text-[9px] md:text-[10px] font-black text-slate-800 group-hover:text-white">{item.data.split(' ')[0]}</span>
                      <span className="text-[6px] md:text-[7px] font-bold uppercase text-slate-400 group-hover:text-white/80">{item.data.split(' ').slice(1).join(' ')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs md:text-sm font-bold text-slate-800 truncate group-hover:text-orange-600 transition-colors">{item.evento}</h4>
                      <p className="text-[10px] md:text-[11px] text-slate-400 truncate flex items-center gap-1">
                        <MapPin size={10} /> {item.local}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="py-4 text-center">
                    <p className="text-slate-400 text-[10px] font-medium italic">Nenhum evento agendado.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Music2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg text-slate-800 leading-tight">Top 5 Difusora</h3>
                </div>
              </div>
              
              <div className="space-y-4 md:space-y-5">
                {topSongs.map((song) => (
                  <div key={song.rank} onClick={() => setSelected(song)}
                    className="flex items-center gap-3 md:gap-4 group cursor-pointer">
                    <span className="text-xl md:text-2xl font-black text-slate-100 group-hover:text-orange-100 transition-colors w-5 md:w-6">{song.rank}</span>
                    <img src={song.cover} alt={song.title} className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs md:text-sm text-slate-800 truncate">{song.title}</p>
                      <p className="text-[10px] md:text-xs text-slate-400 truncate">{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Card */}
            <div className="bg-[#e94700] rounded-[2rem] p-6 md:p-8 text-white shadow-xl shadow-orange-900/10">
              <h3 className="font-bold text-lg md:text-xl mb-2">Siga a Difusora</h3>
              <p className="text-white/70 text-xs md:text-sm mb-6 leading-relaxed">Fique por dentro de tudo que acontece em Colatina e região.</p>
              <div className="flex gap-3 md:gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><Facebook size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><Twitter size={18} /></a>
              </div>
            </div>
          </aside>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 md:py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img src="https://i.postimg.cc/fWdv55vc/LOGO-PP-(1).png" alt="Logo" className="h-10 md:h-12 w-auto grayscale opacity-40 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
            <p className="text-slate-400 text-[10px] md:text-xs font-medium text-center md:text-left">© 2026 Difusora Colatina 104.3 FM.<br className="md:hidden" /> Todos os direitos reservados.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
            <button onClick={() => onNavigate('news')} className="hover:text-orange-600 transition-colors">Notícias</button>
            <button onClick={() => onNavigate('programs')} className="hover:text-orange-600 transition-colors">Programas</button>
            <button onClick={() => onNavigate('podcast')} className="hover:text-orange-600 transition-colors">Estúdio ao Vivo</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-orange-600 transition-colors">Contato</button>
            <button onClick={() => onNavigate('dashboard')} className="hover:text-orange-600 transition-colors text-orange-600/50">Dashboard</button>
          </div>
        </div>
      </footer>

      {/* News Detail Modal (Reuse logic) */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
              
              <button onClick={() => setSelected(null)} className="absolute top-6 right-6 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all">
                <X size={20} />
              </button>

              <div className="overflow-y-auto no-scrollbar">
                {selected.video_url ? (
                  <div className="w-full aspect-video bg-black">
                    <iframe 
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${selected.video_url.split('v=')[1]?.split('&')[0] || selected.video_url.split('/').pop()}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (selected.imagem_url || selected.cover) && (
                  <div className="w-full aspect-video">
                    <img src={selected.imagem_url || selected.cover} alt={selected.titulo || selected.evento || selected.title} className="w-full h-full object-cover" 
                      onError={e => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/news/800/400'; }} />
                  </div>
                )}
                <div className="p-8 space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-widest">
                      {selected.autor || (selected.evento ? 'Agenda' : selected.title ? 'Top 5' : 'Redação')}
                    </span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      {selected.data || (selected.created_at ? new Date(selected.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : '')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 leading-tight">{selected.titulo || selected.evento || selected.title}</h2>
                  {selected.local && (
                    <p className="text-orange-600 text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
                      <MapPin size={12} /> {selected.local}
                    </p>
                  )}
                  {selected.artist && (
                    <p className="text-slate-400 text-sm font-medium">Artista: <span className="text-slate-800">{selected.artist}</span></p>
                  )}
                  <div className="h-1 w-16 bg-orange-600 rounded-full" />
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line text-base">{selected.conteudo}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

// ─── Video Background Component ──────────────────────────
const VideoBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden">
    <video autoPlay muted loop playsInline preload="auto" className="w-full h-full object-cover opacity-80">
      <source src="https://image2url.com/r2/default/videos/1773241632009-36a19a63-51f3-4a08-8cf8-6d6bb985fc30.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent" />
  </div>
);

// ─── Main App ─────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [radioStatus, setRadioStatus] = useState<'paused' | 'playing' | 'loading'>('paused');

  const playerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const STREAM_URL = 'https://sua-radio.com/stream'; // troque pela URL real

  useEffect(() => {
    audioRef.current = new Audio(STREAM_URL);
    audioRef.current.preload = 'none';
    audioRef.current.volume = volume / 100;
    audioRef.current.addEventListener('playing', () => setRadioStatus('playing'));
    audioRef.current.addEventListener('pause',   () => setRadioStatus('paused'));
    audioRef.current.addEventListener('waiting', () => setRadioStatus('loading'));
    audioRef.current.addEventListener('error',   () => setRadioStatus('paused'));
    return () => { audioRef.current?.pause(); };
  }, []);

  useEffect(() => {
    if (location.pathname === '/podcast') {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const first = document.getElementsByTagName('script')[0];
        first.parentNode?.insertBefore(tag, first);
        (window as any).onYouTubeIframeAPIReady = () => initPlayer();
      } else { initPlayer(); }
    }
    return () => { if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null; } };
  }, [location.pathname]);

  const initPlayer = () => {
    if (playerRef.current) return;
    playerRef.current = new (window as any).YT.Player('youtube-player', {
      videoId: 'dQw4w9WgXcQ',
      playerVars: { autoplay: 0, controls: 1, modestbranding: 1, rel: 0 },
    });
  };

  const toggleRadio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause(); audioRef.current.src = ''; setIsPlaying(false);
    } else {
      audioRef.current.src = STREAM_URL; setRadioStatus('loading');
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setRadioStatus('paused'));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value); setVolume(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
    if (v > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted; setIsMuted(!isMuted);
  };

  const statusLabel = { paused: 'RÁDIO EM PAUSA', playing: 'AO VIVO', loading: 'CONECTANDO...' }[radioStatus];

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/" element={
            <LandingPage 
              onPlay={() => {
                navigate('/player');
                if (!isPlaying) toggleRadio();
              }} 
            />
          } />
          
          <Route path="/player" element={
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 flex flex-col items-center justify-between min-h-screen pb-6 pt-8">

              <VideoBackground />

              <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }} className="flex-1 flex items-center justify-center">
                <img src="https://i.postimg.cc/fWdv55vc/LOGO-PP-(1).png" alt="Difusora Colatina 104.3"
                  className="h-16 sm:h-24 w-auto object-contain drop-shadow-[0_0_50px_rgba(249,115,22,0.5)]"
                  referrerPolicy="no-referrer" />
              </motion.div>

              <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="w-full px-4 max-w-sm mx-auto">
                <div className="bg-white/10 backdrop-blur-2xl rounded-[1.75rem] border border-white/15 shadow-2xl overflow-hidden">

                  <div className="flex flex-col items-center pt-8 pb-6 px-6 gap-3">
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">Difusora Colatina 104.3</p>

                    <motion.button whileTap={{ scale: 0.93 }} onClick={toggleRadio}
                      className="relative w-[6.5rem] h-[6.5rem] rounded-full flex items-center justify-center mt-2 shadow-[0_0_60px_rgba(249,115,22,0.55)]"
                      style={{ background: 'radial-gradient(circle at 35% 35%,#f97316,#ea580c)' }}>
                      {radioStatus === 'loading' ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-8 h-8 rounded-full border-t-2 border-white border-2 border-white/20" />
                      ) : isPlaying ? (
                        <Pause className="w-10 h-10" fill="white" color="white" />
                      ) : (
                        <Play className="w-10 h-10 ml-1" fill="white" color="white" />
                      )}
                      {isPlaying && (
                        <motion.span animate={{ scale: [1, 1.55], opacity: [0.35, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                          className="absolute inset-0 rounded-full bg-orange-600" style={{ zIndex: -1 }} />
                      )}
                    </motion.button>

                    <div className="flex items-center gap-1.5 mt-1">
                      {isPlaying && (
                        <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                          className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      )}
                      <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">{statusLabel}</span>
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  <div className="grid grid-cols-2 gap-0">
                    {[
                      { label: 'Estúdio ao Vivo', icon: <Mic2 size={12} className="text-white/60" />, page: 'podcast' },
                      { label: 'Contato', icon: <Mail size={12} className="text-white/60" />, page: 'contact' },
                    ].map((btn, i) => (
                      <motion.button key={btn.page} whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(`/${btn.page}`)}
                        className={`flex items-center justify-center gap-2 py-2 ${i === 0 ? 'border-r border-white/10' : ''} hover:bg-white/8 transition-all active:scale-95`}>
                        {btn.icon}
                        <span className="text-[9px] font-bold tracking-wider uppercase text-white/70">{btn.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  <div className="h-px bg-white/10" />

                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <a href="#" className="text-white/40 hover:text-white transition-colors p-2"><Instagram size={17} /></a>
                      <a href="#" className="text-white/40 hover:text-white transition-colors p-2"><Facebook size={17} /></a>
                      <a href="#" className="text-white/40 hover:text-white transition-colors p-2"><Twitter size={17} /></a>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors p-1">
                        {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={handleVolumeChange}
                        className="w-20 h-1 rounded-full appearance-none cursor-pointer accent-red-500 bg-white/20" />
                    </div>
                  </div>

                </div>

                {/* Botão dashboard discreto */}
                <button onClick={() => navigate('/dashboard')}
                  className="mt-4 mx-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white/15 hover:text-white/30 transition-colors">
                  <Lock size={9} /> Dashboard
                </button>

              </motion.div>
            </motion.div>
          } />

          <Route path="/news" element={<NewsPage />} />
          <Route path="/programs" element={<ProgramsPage onPlay={() => {
            navigate('/player');
            if (!isPlaying) toggleRadio();
          }} />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/podcast" element={
            <motion.div key="podcast" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="relative z-10 flex flex-col min-h-screen">
              
              <VideoBackground />

              <div className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4">
                <div className="w-10" />
                <img src="https://i.postimg.cc/fWdv55vc/LOGO-PP-(1).png" alt="Logo" className="h-8 md:h-10 w-auto object-contain drop-shadow-[0_0_20px_rgba(249,115,22,0.2)]" referrerPolicy="no-referrer" />
                <button onClick={() => navigate('/player')} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full border border-white/15 transition-all active:scale-95 backdrop-blur-md"><X size={20} /></button>
              </div>

              <div className="relative z-10 flex-1 flex flex-col justify-center px-4 pb-4 gap-3">
                <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl" style={{ aspectRatio: '16/9' }}>
                  <div id="youtube-player" className="absolute inset-0 w-full h-full" />
                </div>
                <div className="max-w-2xl mx-auto w-full flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">Estúdio ao Vivo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { const i = document.getElementById('youtube-player'); i?.requestFullscreen?.(); }}
                      className="flex items-center gap-1.5 px-3 py-2.5 bg-white/10 rounded-full border border-white/10 hover:bg-white/15 transition-all active:scale-95 min-h-[44px]">
                      <Maximize2 size={13} /><span className="text-[10px] font-bold tracking-widest uppercase">Tela cheia</span>
                    </button>
                    <button className="p-2.5 bg-white/10 rounded-full border border-white/10 hover:bg-white/15 transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 px-4 py-4 border-t border-white/8">
                <a href="#" className="text-white/40 hover:text-white transition-colors p-2"><Instagram size={18} /></a>
                <a href="#" className="text-white/40 hover:text-white transition-colors p-2"><Facebook size={18} /></a>
                <a href="#" className="text-white/40 hover:text-white transition-colors p-2"><Twitter size={18} /></a>
              </div>
            </motion.div>
          } />

          <Route path="/contact" element={
            <motion.div key="contact" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="relative z-10 flex flex-col min-h-screen">
              
              <VideoBackground />

              <div className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4">
                <div className="w-10" />
                <img src="https://i.postimg.cc/fWdv55vc/LOGO-PP-(1).png" alt="Logo" className="h-8 md:h-10 w-auto object-contain drop-shadow-[0_0_20px_rgba(249,115,22,0.2)]" referrerPolicy="no-referrer" />
                <button onClick={() => navigate('/player')} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full border border-white/15 transition-all active:scale-95 backdrop-blur-md"><X size={20} /></button>
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-10 space-y-4 no-scrollbar">
                <div className="pt-1 pb-3">
                  <h2 className="text-3xl font-bold tracking-tight">Fale Conosco</h2>
                  <p className="text-white/50 text-sm mt-2 leading-relaxed">Sua participação é fundamental para a Difusora 104.3. Mande sua sugestão ou pedido musical.</p>
                </div>
                <div className="space-y-2.5">
                  <a href="mailto:contato@difusora104.com.br" className="flex items-center gap-4 p-4 bg-white/8 rounded-2xl border border-white/10 hover:bg-white/12 transition-all active:scale-[0.98] min-h-[64px]">
                    <div className="w-11 h-11 rounded-xl bg-orange-950/60 border border-orange-800/40 flex items-center justify-center shrink-0"><Mail size={18} className="text-orange-400" /></div>
                    <div><p className="text-[9px] font-bold text-white/35 uppercase tracking-widest">E-mail</p><p className="text-sm font-medium mt-0.5">contato@difusora104.com.br</p></div>
                  </a>
                  <a href="tel:+5527999999999" className="flex items-center gap-4 p-4 bg-white/8 rounded-2xl border border-white/10 hover:bg-white/12 transition-all active:scale-[0.98] min-h-[64px]">
                    <div className="w-11 h-11 rounded-xl bg-orange-950/60 border border-orange-800/40 flex items-center justify-center shrink-0"><Phone size={18} className="text-orange-400" /></div>
                    <div><p className="text-[9px] font-bold text-white/35 uppercase tracking-widest">Telefone</p><p className="text-sm font-medium mt-0.5">+55 (27) 99999-9999</p></div>
                  </a>
                  <div className="flex items-center gap-4 p-4 bg-white/8 rounded-2xl border border-white/10 min-h-[64px]">
                    <div className="w-11 h-11 rounded-xl bg-orange-950/60 border border-orange-800/40 flex items-center justify-center shrink-0"><MapPin size={18} className="text-orange-400" /></div>
                    <div><p className="text-[9px] font-bold text-white/35 uppercase tracking-widest">Localização</p><p className="text-sm font-medium mt-0.5">Colatina, ES — Brasil</p></div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/35">Nome Completo</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-orange-500/40 outline-none transition-all text-white placeholder:text-white/20 text-sm min-h-[50px]" placeholder="Seu nome..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/35">E-mail</label>
                    <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-orange-500/40 outline-none transition-all text-white placeholder:text-white/20 text-sm min-h-[50px]" placeholder="seu@email.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/35">Mensagem</label>
                    <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-orange-500/40 outline-none transition-all h-28 resize-none text-white placeholder:text-white/20 text-sm" placeholder="Sugestão, pedido musical..." />
                  </div>
                  <button className="w-full rounded-xl py-4 font-bold tracking-widest uppercase flex items-center justify-center gap-2 text-sm bg-white text-black transition-all active:scale-[0.98] hover:bg-slate-50 min-h-[52px]">
                    <span>Enviar Mensagem</span><Send size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}