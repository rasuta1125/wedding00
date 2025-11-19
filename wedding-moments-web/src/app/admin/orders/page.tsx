'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Order } from '@/types'

type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

const statusLabels: Record<OrderStatus, string> = {
  pending: '支払い待ち',
  paid: '支払い済み',
  processing: '制作中',
  shipped: '発送済み',
  delivered: '配送完了',
  cancelled: 'キャンセル',
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-gray-100 text-gray-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const q = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[]
      setOrders(ordersData)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: Timestamp.now(),
      })
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ))
      alert('注文ステータスを更新しました')
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('注文ステータスの更新に失敗しました')
    }
  }

  const updateShippingInfo = async (orderId: string, trackingNumber: string, carrier: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        'shippingInfo.trackingNumber': trackingNumber,
        'shippingInfo.carrier': carrier,
        status: 'shipped',
        shippedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      alert('配送情報を更新しました')
      fetchOrders() // Refresh list
    } catch (error) {
      console.error('Error updating shipping info:', error)
      alert('配送情報の更新に失敗しました')
    }
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">注文管理</h1>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
        >
          🔄 更新
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              filter === 'all'
                ? 'border-b-2 border-pink-600 text-pink-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            すべて ({orders.length})
          </button>
          {(Object.keys(statusLabels) as OrderStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                filter === status
                  ? 'border-b-2 border-pink-600 text-pink-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {statusLabels[status]} ({orders.filter(o => o.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注文番号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客情報
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注文日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    注文がありません
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.shippingInfo.name}</div>
                      <div className="text-sm text-gray-500">{order.shippingInfo.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ¥{order.amounts.grandTotal.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status as OrderStatus]}`}>
                        {statusLabels[order.status as OrderStatus]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt && (
                        new Date((order.createdAt as any).toDate()).toLocaleDateString('ja-JP')
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-pink-600 hover:text-pink-900 font-medium"
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateOrderStatus}
          onUpdateShipping={updateShippingInfo}
        />
      )}
    </div>
  )
}

interface OrderDetailModalProps {
  order: Order
  onClose: () => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
  onUpdateShipping: (orderId: string, trackingNumber: string, carrier: string) => void
}

function OrderDetailModal({ order, onClose, onUpdateStatus, onUpdateShipping }: OrderDetailModalProps) {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('ヤマト運輸')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">注文詳細</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Order Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">注文情報</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">注文番号</span>
                  <span className="text-sm font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">注文日時</span>
                  <span className="text-sm">
                    {order.createdAt && new Date((order.createdAt as any).toDate()).toLocaleString('ja-JP')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ステータス</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status as OrderStatus]}`}>
                    {statusLabels[order.status as OrderStatus]}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">配送先情報</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div>{order.shippingInfo.name}</div>
                <div>{order.shippingInfo.email}</div>
                <div>{order.shippingInfo.phone}</div>
                <div>
                  〒{order.shippingInfo.postalCode}<br />
                  {order.shippingInfo.prefecture}{order.shippingInfo.city}<br />
                  {order.shippingInfo.address1}<br />
                  {order.shippingInfo.address2}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">注文内容</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.productName} × {item.quantity}</span>
                    <span className="font-medium">¥{item.totalPrice.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>小計</span>
                    <span>¥{order.amounts.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>消費税</span>
                    <span>¥{order.amounts.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>送料</span>
                    <span>¥{order.amounts.shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold mt-2">
                    <span>合計</span>
                    <span>¥{order.amounts.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Update Status */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">ステータス更新</h3>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(statusLabels) as OrderStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => onUpdateStatus(order.id!, status)}
                    disabled={order.status === status}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      order.status === status
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-pink-600 text-white hover:bg-pink-700'
                    }`}
                  >
                    {statusLabels[status]}
                  </button>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            {order.status === 'paid' || order.status === 'processing' ? (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">配送情報登録</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      配送業者
                    </label>
                    <select
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option>ヤマト運輸</option>
                      <option>佐川急便</option>
                      <option>日本郵便</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      追跡番号
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="1234-5678-9012"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (trackingNumber && carrier) {
                        onUpdateShipping(order.id!, trackingNumber, carrier)
                        onClose()
                      } else {
                        alert('配送業者と追跡番号を入力してください')
                      }
                    }}
                    className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                  >
                    発送済みに更新
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
