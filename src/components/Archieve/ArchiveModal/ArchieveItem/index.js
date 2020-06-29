import React from 'react';

const cls = new Bem('achieve-item');

export default function AchieveItem({ item }) {
    return (
        <div { ...cls() }>
            Item
        </div>
    );
}